import { useState } from 'react';
import { Star, X, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string, tags: string[]) => void;
    professionalName: string;
    professionalImage: string;
    professionalTrade: string;
}

const QUICK_TAGS = ['Puntual', 'Precio justo', 'Prolijo', 'Recomendable', 'Rápido', 'Profesional'];

export function ReviewModal({
    isOpen,
    onClose,
    onSubmit,
    professionalName,
    professionalImage,
    professionalTrade,
}: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    if (!isOpen) return null;

    const activeRating = hoverRating || rating;

    const getRatingLabel = (r: number) => {
        if (r === 0) return '';
        if (r === 1) return 'Malo';
        if (r === 2) return 'Regular';
        if (r === 3) return 'Bueno';
        if (r === 4) return 'Muy bueno';
        return 'Excelente';
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = () => {
        if (rating === 0) return;
        setIsSubmitting(true);

        setTimeout(() => {
            onSubmit(rating, comment, selectedTags);
            setIsSubmitting(false);
            setIsSubmitted(true);

            setTimeout(() => {
                setIsSubmitted(false);
                setRating(0);
                setComment('');
                setSelectedTags([]);
                onClose();
            }, 1800);
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease-out] shadow-2xl">
                {/* Success State */}
                {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4 animate-[scaleIn_0.5s_ease-out]">
                            <ShieldCheck size={36} className="text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-1">¡Reseña enviada!</h2>
                        <p className="text-sm text-slate-500">Tu reseña verificada fue publicada</p>
                        <div className="flex mt-3">
                            {Array.from({ length: rating }, (_, i) => (
                                <Star key={i} size={20} className="text-amber-400 fill-amber-400" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={18} className="text-emerald-500" />
                                <h2 className="text-lg font-bold text-slate-900">Reseña Verificada</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="p-5 space-y-6">
                            {/* Professional Preview */}
                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <img
                                    src={professionalImage}
                                    alt={professionalName}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">{professionalName}</h3>
                                    <p className="text-xs text-emerald-600 font-medium">{professionalTrade}</p>
                                </div>
                            </div>

                            {/* Stars */}
                            <div className="text-center">
                                <p className="text-sm font-medium text-slate-600 mb-3">¿Cómo fue tu experiencia?</p>
                                <div className="flex justify-center gap-2 mb-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                            className={clsx(
                                                "p-1 transition-all duration-150",
                                                star <= activeRating
                                                    ? "scale-110"
                                                    : "scale-100 opacity-40"
                                            )}
                                        >
                                            <Star
                                                size={36}
                                                className={clsx(
                                                    "transition-colors duration-150",
                                                    star <= activeRating
                                                        ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                                                        : "text-slate-300 fill-slate-200"
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className={clsx(
                                    "text-sm font-bold transition-all h-5",
                                    activeRating >= 4 ? "text-emerald-600" :
                                        activeRating >= 3 ? "text-amber-600" :
                                            activeRating >= 1 ? "text-red-500" : "text-transparent"
                                )}>
                                    {getRatingLabel(activeRating)}
                                </p>
                            </div>

                            {/* Quick Tags */}
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Etiquetas rápidas
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {QUICK_TAGS.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={clsx(
                                                "px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 border",
                                                selectedTags.includes(tag)
                                                    ? "bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20"
                                                    : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-600"
                                            )}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                                    Comentario (opcional)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value.slice(0, 300))}
                                    placeholder="Contá cómo fue tu experiencia con este profesional..."
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all resize-none placeholder:text-slate-400"
                                />
                                <p className="text-right text-[10px] text-slate-400 mt-1">
                                    {comment.length}/300
                                </p>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={rating === 0 || isSubmitting}
                                className={clsx(
                                    "w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                                    rating > 0
                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                )}
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Star size={16} fill="currentColor" />
                                        Enviar reseña verificada
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
