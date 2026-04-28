import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toggleFavorite, checkIsFavorite } from '../services/favorites';

export function useFavorites(professionalId?: string) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFavoriteStatus() {
      if (!user || !professionalId) {
        setIsFavorite(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const status = await checkIsFavorite(user.id, professionalId);
        setIsFavorite(status);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadFavoriteStatus();
  }, [user, professionalId]);

  const handleToggleFavorite = async () => {
    if (!user) {
      alert("Debes iniciar sesión para guardar favoritos.");
      return;
    }

    if (!professionalId) return;

    // Optimistic UI update
    const previousState = isFavorite;
    setIsFavorite(!isFavorite);

    try {
      const newStatus = await toggleFavorite(user.id, professionalId);
      setIsFavorite(newStatus);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert on error
      setIsFavorite(previousState);
      alert("Hubo un error al actualizar tus favoritos.");
    }
  };

  return {
    isFavorite,
    isLoading,
    toggleFavorite: handleToggleFavorite
  };
}
