import { supabase } from '../lib/supabase';
import type { ProfessionalWithProfile } from '../lib/database.types';

// Backward-compatible type that matches what the UI expects
export interface ProfessionalDisplay {
  id: string;
  name: string;
  trade: string;
  rating: number;
  reviews: number;
  lat: number;
  lng: number;
  image: string;
  isVerified: boolean;
  isEarlyAdopter: boolean;
  isBoosted: boolean;
  status: string;
  description: string;
  skills: string[];
}

// Convert DB row to display format
function toDisplay(pro: ProfessionalWithProfile): ProfessionalDisplay {
  return {
    id: pro.id,
    name: pro.profiles?.name || 'Profesional',
    trade: pro.trade,
    rating: pro.rating,
    reviews: pro.review_count,
    lat: pro.lat,
    lng: pro.lng,
    image: pro.profiles?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    isVerified: pro.is_verified,
    isEarlyAdopter: pro.is_early_adopter,
    isBoosted: pro.is_boosted,
    status: pro.status,
    description: pro.description,
    skills: pro.skills,
  };
}

export async function getProfessionals(): Promise<ProfessionalDisplay[]> {
  const { data, error } = await supabase
    .from('professionals')
    .select('*, profiles(*)')
    .order('is_boosted', { ascending: false })
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error fetching professionals:', error);
    return [];
  }

  return (data as unknown as ProfessionalWithProfile[]).map(toDisplay);
}

export async function getProfessionalById(id: string): Promise<ProfessionalDisplay | null> {
  const { data, error } = await supabase
    .from('professionals')
    .select('*, profiles(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching professional:', error);
    return null;
  }

  return toDisplay(data as unknown as ProfessionalWithProfile);
}

export async function getProfessionalsByTrade(trade: string): Promise<ProfessionalDisplay[]> {
  const { data, error } = await supabase
    .from('professionals')
    .select('*, profiles(*)')
    .eq('trade', trade)
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error fetching professionals by trade:', error);
    return [];
  }

  return (data as unknown as ProfessionalWithProfile[]).map(toDisplay);
}

export async function searchProfessionals(query: string): Promise<ProfessionalDisplay[]> {
  const { data, error } = await supabase
    .from('professionals')
    .select('*, profiles(*)')
    .or(`trade.ilike.%${query}%,description.ilike.%${query}%,status.ilike.%${query}%`);

  if (error) {
    console.error('Error searching professionals:', error);
    return [];
  }

  return (data as unknown as ProfessionalWithProfile[]).map(toDisplay);
}

export async function updateProfessionalProfile(
  professionalId: string,
  updates: {
    trade?: string;
    description?: string;
    skills?: string[];
    status?: string;
    lat?: number;
    lng?: number;
    is_boosted?: boolean;
  }
) {
  const { error } = await supabase
    .from('professionals')
    .update(updates)
    .eq('id', professionalId);

  if (error) {
    console.error('Error updating professional:', error);
    return { error: error.message };
  }

  return { error: null };
}

export async function setProfessionalBoosted(profileId: string) {
  const { error } = await supabase
    .from('professionals')
    .update({ is_boosted: true })
    .eq('profile_id', profileId);

  if (error) {
    console.error('Error boosting professional:', error);
    return { error: error.message };
  }

  return { error: null };
}
