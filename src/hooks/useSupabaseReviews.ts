import { useState, useEffect } from 'react';
import { getReviewsFor, type ReviewDisplay } from '../services/reviews';

export type { ReviewDisplay } from '../services/reviews';

interface UseReviewsResult {
  reviews: ReviewDisplay[];
  isLoading: boolean;
  error: string | null;
}

export function useSupabaseReviews(professionalId: string | undefined): UseReviewsResult {
  const [reviews, setReviews] = useState<ReviewDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!professionalId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchReviews() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getReviewsFor(professionalId!);
        if (!cancelled) {
          setReviews(data);
        }
      } catch (err) {
        console.error('Error loading reviews:', err);
        if (!cancelled) {
          setError('Error al cargar las reseñas');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchReviews();
    return () => { cancelled = true; };
  }, [professionalId]);

  return { reviews, isLoading, error };
}
