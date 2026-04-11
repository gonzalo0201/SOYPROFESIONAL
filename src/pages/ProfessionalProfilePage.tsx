import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, CheckCircle, MapPin, MessageCircle, Phone, Share2, Heart, Clock, Briefcase, ShieldCheck, Loader2 } from 'lucide-react';
import { useProfessional } from '../hooks/useProfessionals';
import { useSupabaseReviews } from '../hooks/useSupabaseReviews';
import { useSupabasePortfolio } from '../hooks/useSupabasePortfolio';
import { PortfolioGallery } from '../components/portfolio/PortfolioGallery';
import clsx from 'clsx';


export function ProfessionalProfilePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { professional, isLoading: proLoading } = useProfessional(id);
    const { reviews, isLoading: reviewsLoading } = useSupabaseReviews(id);
    const { portfolio, isLoading: portfolioLoading } = useSupabasePortfolio(id);

    if (proLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-emerald-500 animate-spin" />
                    <p className="text-slate-400 text-sm">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    if (!professional) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <p className="text-slate-400 mb-4">Profesional no encontrado</p>
                    <button onClick={() => navigate(-1)} className="text-emerald-600 font-bold text-sm">Volver</button>
                </div>
            </div>
        );
    }

    // Calculate rating stats
    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : professional.rating.toString();

    const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => r.rating === star).length;
        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
        return { star, count, percentage };
    });

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={14}
                className={clsx(
                    i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'
                )}
            />
        ));
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
        return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
    };

    // Convert portfolio to the format PortfolioGallery expects
    const portfolioItems = portfolio.map(p => ({
        id: p.id,
        professionalId: p.professionalId,
        images: p.images,
        caption: p.caption,
        description: p.description,
        date: p.date,
        category: p.category as 'antes-despues' | 'en-progreso' | 'terminado' | 'general',
        tags: p.tags,
        likes: p.likes,
        comments: p.comments,
        location: p.location,
    }));

    return (
        <div className="bg-slate-50 min-h-screen pb-28">
            {/* Hero Header */}
            <div className="bg-slate-800 text-white relative overflow-hidden">
                {/* Background blur */}
                <div className="absolute inset-0 opacity-20">
                    <img src={professional.image} alt="" className="w-full h-full object-cover blur-3xl scale-110" />
                </div>

                {/* Top bar */}
                <div className="relative z-10 px-4 pt-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft size={22} />
                    </button>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <Share2 size={18} />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <Heart size={18} />
                        </button>
                    </div>
                </div>

                {/* Profile info */}
                <div className="relative z-10 flex flex-col items-center px-6 pb-8 pt-2">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl mb-4">
                        <img src={professional.image} alt={professional.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold">{professional.name}</h1>
                        {professional.isVerified && <CheckCircle size={20} className="text-emerald-400 fill-white" />}
                    </div>

                    <p className="text-emerald-300 font-semibold text-sm mb-2">{professional.trade}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex">{renderStars(parseFloat(avgRating))}</div>
                        <span className="text-white font-bold text-sm">{avgRating}</span>
                        <span className="text-slate-300 text-xs">({reviews.length} reseñas)</span>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-white/90">{professional.status}</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 -mt-4 relative z-20">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-3 flex gap-2">
                    <Link
                        to={`/chat/new/${professional.id}`}
                        className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-md shadow-emerald-500/20"
                    >
                        <MessageCircle size={16} />
                        Enviar mensaje
                    </Link>
                    <button className="bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 active:scale-[0.98] transition-all">
                        <Phone size={16} />
                        Llamar
                    </button>
                </div>
            </div>

            <div className="px-4 mt-4 space-y-4">
                {/* About */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h2 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                        <Briefcase size={14} className="text-emerald-500" />
                        Sobre mí
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{professional.description}</p>

                    {/* Info cards */}
                    <div className="grid grid-cols-3 gap-2">
                        {professional.isVerified && (
                            <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                                <ShieldCheck size={18} className="text-emerald-600 mx-auto mb-1" />
                                <p className="text-[10px] text-emerald-700 font-bold">Verificado</p>
                            </div>
                        )}
                        <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                            <Star size={18} className="text-amber-500 mx-auto mb-1 fill-amber-500" />
                            <p className="text-[10px] text-amber-700 font-bold">{avgRating} estrellas</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                            <Clock size={18} className="text-blue-500 mx-auto mb-1" />
                            <p className="text-[10px] text-blue-700 font-bold">Resp. rápida</p>
                        </div>
                    </div>
                </div>

                {/* Skills */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h2 className="font-bold text-slate-900 text-sm mb-3">Especialidades</h2>
                    <div className="flex flex-wrap gap-2">
                        {professional.skills.map(skill => (
                            <span key={skill} className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-2 rounded-xl border border-slate-200">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Portfolio Gallery */}
                {portfolioLoading ? (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex items-center justify-center">
                        <Loader2 size={24} className="text-emerald-500 animate-spin" />
                    </div>
                ) : (
                    <PortfolioGallery items={portfolioItems} professionalId={id || ''} />
                )}

                {/* Reviews with Distribution */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <Star size={14} className="text-amber-400 fill-amber-400" />
                            Reseñas ({reviews.length})
                        </h2>
                    </div>

                    {reviewsLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 size={24} className="text-emerald-500 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Rating Distribution Bar */}
                            {reviews.length > 0 && (
                                <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="text-center">
                                            <p className="text-3xl font-black text-slate-900">{avgRating}</p>
                                            <div className="flex justify-center mt-0.5">{renderStars(parseFloat(avgRating))}</div>
                                            <p className="text-[10px] text-slate-400 mt-1">{reviews.length} reseñas</p>
                                        </div>
                                        <div className="flex-1 space-y-1.5">
                                            {ratingDistribution.map(({ star, count, percentage }) => (
                                                <div key={star} className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-slate-500 w-3">{star}</span>
                                                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="bg-amber-400 h-full rounded-full transition-all duration-500"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 w-5 text-right">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Review List */}
                            <div className="space-y-4">
                                {reviews.map(review => (
                                    <div key={review.id} className="flex gap-3">
                                        <img src={review.clientAvatar} alt={review.clientName} className="w-9 h-9 rounded-full object-cover shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <h4 className="font-bold text-slate-900 text-xs">{review.clientName}</h4>
                                                    {review.isVerified && (
                                                        <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-200">
                                                            <ShieldCheck size={8} />
                                                            Verificada
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-400">{formatDate(review.createdAt)}</span>
                                            </div>
                                            <div className="flex mb-1">{renderStars(review.rating)}</div>
                                            {review.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-1.5">
                                                    {review.tags.map(tag => (
                                                        <span key={tag} className="bg-emerald-50 text-emerald-600 text-[9px] font-medium px-2 py-0.5 rounded-full border border-emerald-100">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-xs text-slate-600 leading-relaxed">{review.comment}</p>
                                        </div>
                                    </div>
                                ))}

                                {reviews.length === 0 && (
                                    <div className="text-center py-6 text-slate-400">
                                        <Star size={24} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-sm font-medium">Sin reseñas aún</p>
                                        <p className="text-xs mt-1">Las reseñas verificadas aparecerán aquí</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Location hint */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
                        <MapPin size={14} className="text-emerald-500" />
                        Zona de trabajo
                    </h2>
                    <p className="text-sm text-slate-500">Bahía Blanca y zona sur del Gran Buenos Aires</p>
                </div>
            </div>

            {/* Sticky bottom CTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 z-30">
                <Link
                    to={`/chat/new/${professional.id}`}
                    className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20"
                >
                    <MessageCircle size={18} />
                    Contactar a {professional.name.split(' ')[0]}
                </Link>
            </div>
        </div>
    );
}
