import { supabase } from '../lib/supabase';
import type { Professional, ProfessionalWithProfile } from '../lib/database.types';

export async function toggleFavorite(userId: string, professionalId: string): Promise<boolean> {
  // First check if it exists
  const { data: existing } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .eq('professional_id', professionalId)
    .single();

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('professional_id', professionalId);
      
    if (error) throw error;
    return false; // isFavorite is now false
  } else {
    // Add favorite
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        professional_id: professionalId
      });
      
    if (error) throw error;
    return true; // isFavorite is now true
  }
}

export async function checkIsFavorite(userId: string, professionalId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .eq('professional_id', professionalId)
    .maybeSingle();

  if (error) return false;
  return !!data;
}

export async function getUserFavorites(userId: string): Promise<Professional[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('professional_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  if (data.length === 0) return [];

  const professionalIds = data.map(f => f.professional_id);

  // Fetch the professionals details
  const { data: professionals, error: proError } = await supabase
    .from('professionals')
    .select(`
      *,
      profiles (*)
    `)
    .in('id', professionalIds);

  if (proError || !professionals) return [];

  // Map to format that UI expects (combining profile fields)
  return professionals.map(p => ({
    ...p,
    name: p.profiles?.name || 'Usuario',
    image: p.profiles?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
  })) as any;
}
