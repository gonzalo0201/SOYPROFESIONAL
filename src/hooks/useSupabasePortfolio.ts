import { useState, useEffect } from 'react';
import { getPortfolioFor, type PortfolioDisplay } from '../services/portfolio';

export type { PortfolioDisplay } from '../services/portfolio';

interface UsePortfolioResult {
  portfolio: PortfolioDisplay[];
  isLoading: boolean;
  error: string | null;
}

export function useSupabasePortfolio(professionalId: string | undefined): UsePortfolioResult {
  const [portfolio, setPortfolio] = useState<PortfolioDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!professionalId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchPortfolio() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPortfolioFor(professionalId!);
        if (!cancelled) {
          setPortfolio(data);
        }
      } catch (err) {
        console.error('Error loading portfolio:', err);
        if (!cancelled) {
          setError('Error al cargar el portfolio');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchPortfolio();
    return () => { cancelled = true; };
  }, [professionalId]);

  return { portfolio, isLoading, error };
}
