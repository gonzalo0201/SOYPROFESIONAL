import { supabase } from '../lib/supabase';
import type { Review } from '../lib/database.types';

export interface ReviewDisplay {
  id: string;
  professionalId: string;
  clientName: string;
  clientAvatar: string;
  rating: number;
  comment: string;
  tags: string[];
  isVerified: boolean;
  createdAt: string;
}

function toDisplay(review: Review): ReviewDisplay {
  return {
    id: review.id,
    professionalId: review.professional_id,
    clientName: review.client_name,
    clientAvatar: review.client_avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop',
    rating: review.rating,
    comment: review.comment,
    tags: review.tags,
    isVerified: review.is_verified,
    createdAt: review.created_at,
  };
}

export async function getReviewsFor(professionalId: string): Promise<ReviewDisplay[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('professional_id', professionalId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  return data.map(toDisplay);
}

export async function submitReview(
  professionalId: string,
  clientId: string,
  clientName: string,
  clientAvatar: string,
  rating: number,
  comment: string,
  tags: string[]
): Promise<{ data: ReviewDisplay | null; error: string | null }> {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      professional_id: professionalId,
      client_id: clientId,
      client_name: clientName,
      client_avatar: clientAvatar,
      rating,
      comment,
      tags,
      is_verified: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error submitting review:', error);
    return { data: null, error: error.message };
  }

  // Update professional's review count and rating
  await updateProfessionalRating(professionalId);

  return { data: toDisplay(data), error: null };
}

async function updateProfessionalRating(professionalId: string) {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('professional_id', professionalId);

  if (reviews && reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await supabase
      .from('professionals')
      .update({
        rating: Math.round(avgRating * 10) / 10,
        review_count: reviews.length,
      })
      .eq('id', professionalId);
  }
}

export async function getReviewStats(professionalId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('professional_id', professionalId);

  if (error || !data) return { average: 0, total: 0, distribution: {} };

  const total = data.length;
  const average = total > 0
    ? Math.round((data.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10
    : 0;

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  data.forEach(r => {
    distribution[r.rating] = (distribution[r.rating] || 0) + 1;
  });

  return { average, total, distribution };
}
