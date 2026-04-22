import { useState, useEffect, useCallback } from 'react';
import { getProfessionals, getProfessionalById, searchProfessionals, type ProfessionalDisplay } from '../services/professionals';

// Re-export the type so consumers can import from the hook
export type { ProfessionalDisplay } from '../services/professionals';

interface UseProfessionalsResult {
  professionals: ProfessionalDisplay[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// We remove global caching since fetching is parameterized natively now.

export function useProfessionals(category?: string, searchTerm?: string): UseProfessionalsResult {
  const [professionals, setProfessionals] = useState<ProfessionalDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProfessionals({ category, searchTerm });
      setProfessionals(data);
    } catch (err) {
      console.error('Error loading professionals:', err);
      setError('Error al cargar profesionales');
    } finally {
      setIsLoading(false);
    }
  }, [category, searchTerm]);

  useEffect(() => {
    // Add a small debounce if there is a searchTerm
    const delay = searchTerm ? 300 : 0;
    const timeoutId = setTimeout(() => {
        fetchData();
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [fetchData, searchTerm]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { professionals, isLoading, error, refetch };
}

// Hook for a single professional
interface UseProfessionalResult {
  professional: ProfessionalDisplay | null;
  isLoading: boolean;
  error: string | null;
}

export function useProfessional(id: string | undefined): UseProfessionalResult {
  const [professional, setProfessional] = useState<ProfessionalDisplay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchPro() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getProfessionalById(id!);
        if (!cancelled) {
          setProfessional(data);
        }
      } catch (err) {
        console.error('Error loading professional:', err);
        if (!cancelled) {
          setError('Error al cargar el profesional');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchPro();
    return () => { cancelled = true; };
  }, [id]);

  return { professional, isLoading, error };
}

// Hook for searching professionals
export function useSearchProfessionals() {
  const [results, setResults] = useState<ProfessionalDisplay[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const data = await searchProfessionals(query);
      setResults(data);
    } catch (err) {
      console.error('Error searching professionals:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  return { results, isSearching, search };
}
