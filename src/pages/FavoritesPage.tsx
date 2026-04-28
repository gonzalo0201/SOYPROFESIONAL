import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserFavorites } from '../services/favorites';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { Heart, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Professional } from '../lib/database.types';

export function FavoritesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getUserFavorites(user.id);
        setFavorites(data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFavorites();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={32} className="text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 text-center bg-slate-50 pb-24 min-h-screen">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-500">
          <Heart size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Inicia sesión</h2>
        <p className="text-slate-500 mb-6 max-w-xs">Debes iniciar sesión para ver y guardar a tus profesionales favoritos.</p>
        <button 
          onClick={() => navigate('/profile')}
          className="bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl"
        >
          Ir al perfil
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <div className="bg-white px-4 py-6 shadow-sm border-b border-slate-100 sticky top-0 z-10">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Heart className="text-emerald-500 fill-emerald-500" />
          Mis Favoritos
        </h1>
        <p className="text-slate-500 text-sm mt-1">Profesionales que has guardado</p>
      </div>

      <div className="p-4 space-y-4">
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 mx-auto text-slate-300">
              <Heart size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Aún no tienes favoritos</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">Explora profesionales y guárdalos aquí para tenerlos siempre a mano.</p>
            <button 
              onClick={() => navigate('/search')}
              className="mt-6 text-emerald-600 font-bold bg-emerald-50 px-6 py-2.5 rounded-xl border border-emerald-100"
            >
              Explorar profesionales
            </button>
          </div>
        ) : (
          favorites.map(pro => (
            <ProfessionalCard key={pro.id} professional={pro as any} />
          ))
        )}
      </div>
    </div>
  );
}
