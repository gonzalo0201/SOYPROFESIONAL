import { supabase } from '../lib/supabase';
import type { ProfessionalWithProfile } from '../lib/database.types';
import { PROFESSIONS_LIST, SERVICES_LIST, TRADES_LIST, TECNICS_LIST } from '../pages/PostPage';

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
  socialLinks?: Record<string, string> | null;
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
    socialLinks: (pro.social_links as Record<string, string>) || null,
  };
}

export async function getProfessionals(options?: {
  categories?: string[];
  searchTerm?: string;
  limit?: number;
}): Promise<ProfessionalDisplay[]> {
  let query = supabase
    .from('professionals')
    .select('*, profiles!inner(*)') // Use !inner to optionally filter by related user's name
    .order('is_boosted', { ascending: false })
    .order('rating', { ascending: false })
    .limit(options?.limit || 50);

  // Apply Search Term Filter
  if (options?.searchTerm) {
    const s = `%${options.searchTerm}%`;
    // We want to match trade OR description OR the related profiles.name
    // However, PostgREST doesn't inherently support OR across tables without RPC or specialized syntax
    // For simplicity, we filter by trade or description across professionals.
    query = query.or(`trade.ilike.${s},description.ilike.${s}`);
  }

  // Apply Multiple Categories Filter
  if (options?.categories && options.categories.length > 0) {
    // If all 4 are selected, it's essentially "todos", but we can still natively filter
    let allowedTrades: string[] = [];
    if (options.categories.includes('servicio')) allowedTrades.push(...SERVICES_LIST);
    if (options.categories.includes('tecnico')) allowedTrades.push(...TECNICS_LIST);
    if (options.categories.includes('profesional')) allowedTrades.push(...PROFESSIONS_LIST);
    if (options.categories.includes('oficio')) allowedTrades.push(...TRADES_LIST);

    if (allowedTrades.length > 0) {
      // Find matching items via 'in'
      query = query.in('trade', allowedTrades);
    }
  }

  const { data, error } = await query;

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
    social_links?: Record<string, string>;
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

export async function createProfessional(data: {
  profile_id: string;
  trade: string;
  description: string;
  skills: string[];
  lat: number;
  lng: number;
  status: string;
}) {
  const { data: result, error } = await supabase
    .from('professionals')
    .insert([
      {
        profile_id: data.profile_id,
        trade: data.trade,
        description: data.description,
        skills: data.skills,
        lat: data.lat,
        lng: data.lng,
        status: data.status,
        rating: 0,
        review_count: 0,
        is_verified: false,
        is_early_adopter: true,
        is_boosted: false
      }
    ])
    .select()
    .single();

  if (error) throw error;
  
  // Upgrade profile role to 'professional'
  await supabase
    .from('profiles')
    .update({ role: 'professional' })
    .eq('id', data.profile_id);
    
  return result;
}
