import { supabase } from '../lib/supabase';
import type { PortfolioItem } from '../lib/database.types';

export interface PortfolioDisplay {
  id: string;
  professionalId: string;
  images: string[];
  caption: string;
  description: string;
  date: string;
  category: 'antes-despues' | 'en-progreso' | 'terminado' | 'general';
  tags: string[];
  likes: number;
  comments: number;
  location?: string;
}

function toDisplay(item: PortfolioItem): PortfolioDisplay {
  return {
    id: item.id,
    professionalId: item.professional_id,
    images: item.images,
    caption: item.caption,
    description: item.description,
    date: item.created_at,
    category: item.category,
    tags: item.tags,
    likes: item.likes,
    comments: item.comments,
    location: item.location || undefined,
  };
}

export async function getPortfolioFor(professionalId: string): Promise<PortfolioDisplay[]> {
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('professional_id', professionalId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching portfolio:', error);
    return [];
  }

  return data.map(toDisplay);
}

export async function addPortfolioItem(item: {
  professional_id: string;
  images: string[];
  caption: string;
  description: string;
  category: 'antes-despues' | 'en-progreso' | 'terminado' | 'general';
  tags: string[];
  location?: string;
}): Promise<{ data: PortfolioDisplay | null; error: string | null }> {
  const { data, error } = await supabase
    .from('portfolio_items')
    .insert({
      ...item,
      likes: 0,
      comments: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding portfolio item:', error);
    return { data: null, error: error.message };
  }

  return { data: toDisplay(data), error: null };
}

export async function getPortfolioStats(professionalId: string) {
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('images, likes, comments')
    .eq('professional_id', professionalId);

  if (error || !data) {
    return { totalPhotos: 0, totalLikes: 0, totalComments: 0, totalProjects: 0 };
  }

  return {
    totalPhotos: data.reduce((sum, item) => sum + item.images.length, 0),
    totalLikes: data.reduce((sum, item) => sum + item.likes, 0),
    totalComments: data.reduce((sum, item) => sum + item.comments, 0),
    totalProjects: data.length,
  };
}
