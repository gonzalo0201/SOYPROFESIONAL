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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch profile from profiles table.
   * If the profile doesn't exist (e.g. first Google OAuth login), auto-create it.
   */
  const fetchOrCreateProfile = async (authUser: User): Promise<Profile | null> => {
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

      const name = authUser.user_metadata?.full_name
        || authUser.user_metadata?.name
        || authUser.email?.split('@')[0]
        || 'Usuario';
      const email = authUser.email || '';
      const avatarUrl = authUser.user_metadata?.avatar_url
        || authUser.user_metadata?.picture
        || null;

      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          name,
          email,
          avatar_url: avatarUrl,
          role: 'client',
        })
        .select()
        .single();

      if (insertError) {
        // Could be a race condition (profile was just created), try fetching again
        console.error('[Auth] Error creating profile:', insertError);
        const { data: retryData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        return retryData;
      }

      return newProfile;
    }

    console.error('[Auth] Error fetching profile:', error);
    return null;
  };

  // Listen for auth state changes
  useEffect(() => {
    let mounted = true;

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
      subscription.unsubscribe();
    };
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
      // Translate common errors to Spanish
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
