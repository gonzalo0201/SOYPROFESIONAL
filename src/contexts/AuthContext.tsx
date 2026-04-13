import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '../lib/database.types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Build a fallback profile from user metadata (Google OAuth data)
 * Used when we can't fetch/create in Supabase (RLS issues, etc.)
 */
function buildFallbackProfile(authUser: User): Profile {
  return {
    id: authUser.id,
    name: authUser.user_metadata?.full_name
      || authUser.user_metadata?.name
      || authUser.email?.split('@')[0]
      || 'Usuario',
    email: authUser.email || '',
    avatar_url: authUser.user_metadata?.avatar_url
      || authUser.user_metadata?.picture
      || null,
    role: 'client',
    created_at: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch profile from profiles table.
   * If the profile doesn't exist (e.g. first Google OAuth login), auto-create it.
   * If anything fails, return a fallback profile from auth metadata.
   */
  const fetchOrCreateProfile = async (authUser: User): Promise<Profile> => {
    try {
      // 1) Try to fetch existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (data) return data;

      // 2) Profile doesn't exist — auto-create from OAuth metadata
      if (error && error.code === 'PGRST116') {
        console.log('[Auth] Profile not found, creating from OAuth data...');

        const fallback = buildFallbackProfile(authUser);

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: fallback.id,
            name: fallback.name,
            email: fallback.email,
            avatar_url: fallback.avatar_url,
            role: 'client',
          })
          .select()
          .single();

        if (insertError) {
          console.warn('[Auth] Could not create profile in DB, using fallback:', insertError.message);
          // Try one more fetch (race condition - another tab may have created it)
          const { data: retryData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
          return retryData || fallback;
        }

        return newProfile;
      }

      // 3) Other fetch error — use fallback
      console.warn('[Auth] Error fetching profile, using fallback:', error?.message);
      return buildFallbackProfile(authUser);
    } catch (err) {
      console.warn('[Auth] Exception in fetchOrCreateProfile, using fallback:', err);
      return buildFallbackProfile(authUser);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    let mounted = true;

    // Safety timeout: never stay in loading state for more than 5 seconds
    const safetyTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn('[Auth] Safety timeout reached, forcing isLoading=false');
        setIsLoading(false);
      }
    }, 5000);

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (!mounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const userProfile = await fetchOrCreateProfile(currentSession.user);
        if (mounted) setProfile(userProfile);
      }
      if (mounted) setIsLoading(false);
    }).catch((err) => {
      console.error('[Auth] Error getting session:', err);
      if (mounted) setIsLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          const userProfile = await fetchOrCreateProfile(newSession.user);
          if (mounted) setProfile(userProfile);
        } else {
          setProfile(null);
        }
        if (mounted) setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) return { error: error.message };

    // Create profile in profiles table
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        name,
        email,
        role: 'client',
      });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return { error: 'Error al crear el perfil' };
      }
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const errorMessages: Record<string, string> = {
        'Invalid login credentials': 'Email o contraseña incorrectos',
        'Email not confirmed': 'Necesitás confirmar tu email primero',
      };
      return { error: errorMessages[error.message] || error.message };
    }

    return { error: null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No hay usuario autenticado' };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) return { error: error.message };

    // Refresh profile locally
    const updated = await fetchOrCreateProfile(user);
    setProfile(updated);

    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
