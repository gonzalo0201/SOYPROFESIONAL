import { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import { submitReview } from '../services/reviews';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';

interface WriteReviewModalProps {
  professionalId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function WriteReviewModal({ professionalId, isOpen, onClose, onSuccess }: WriteReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Debes iniciar sesión para escribir una reseña.");
      return;
    }
    if (rating === 0) {
      setError("Por favor, selecciona una calificación.");
      return;
    }

    setIsSubmitting(true);
    setError('');

    const clientAvatar = user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop';
    const clientName = user.user_metadata?.name || user.user_metadata?.full_name || 'Usuario';

    const { error: submitError } = await submitReview(
      professionalId,
      user.id,
      clientName,
      clientAvatar,
      rating,
      comment,
      [] // tags can be added later
    );

    setIsSubmitting(false);

    if (submitError) {
      setError(submitError);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 flex flex-col items-center justify-end sm:justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Escribir Reseña</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 text-center">Calificación</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    size={32}
                    className={clsx(
                      "transition-colors",
                      (hoverRating || rating) >= star 
                        ? 'text-emerald-400 fill-emerald-400' 
                        : 'text-slate-200 fill-slate-200'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Comentario</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="¿Cómo fue tu experiencia con este profesional?"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none h-32 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Enviando...
              </>
            ) : (
              'Publicar Reseña'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
