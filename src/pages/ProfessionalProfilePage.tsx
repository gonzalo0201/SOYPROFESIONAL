import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Share2, Heart, Clock, Briefcase, Loader2, User, Mail, MessageCircle, Instagram, Facebook } from 'lucide-react';
import { useProfessional } from '../hooks/useProfessionals';
import { useSupabaseReviews } from '../hooks/useSupabaseReviews';
import { useSupabasePortfolio } from '../hooks/useSupabasePortfolio';
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
                <Loader2 size={32} className="text-emerald-500 animate-spin" />
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

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : professional.rating.toString();

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={14}
                className={clsx(
                    i < Math.floor(rating) ? 'text-emerald-400 fill-emerald-400' : 'text-slate-200 fill-slate-200'
                )}
            />
        ));
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const diffDays = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        return `Hace ${Math.floor(diffDays / 7)} semana(s)`;
    };

    // Flatten portfolio images and limit to 10
    const allPhotos = portfolio.flatMap(p => p.images).slice(0, 10);
    const socialLinks = professional.socialLinks || {};
    const whatsappNumber = socialLinks.whatsapp || "No disponible";

    const handleWhatsAppClick = () => {
        if (!socialLinks.whatsapp) return;
        const number = socialLinks.whatsapp.replace(/\D/g, ''); // Extract only digits
        const text = encodeURIComponent(`Hola ${professional.name}, vi tu perfil en SoyProfesional y me gustaría consultarte por tus servicios.`);
        window.open(`https://wa.me/${number}?text=${text}`, '_blank');
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-28">
            {/* Hero Banner with Main Photo */}
            <div className="relative h-64 w-full bg-slate-900 overflow-hidden">
                <img 
                    src={professional.image} 
                    alt={professional.name} 
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                
                {/* Top Nav inside hero */}
                <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 bg-black/30 backdrop-blur text-white rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex gap-2 text-white">
                        <button className="p-2 bg-black/30 backdrop-blur rounded-full transition-colors">
                            <Share2 size={18} />
                        </button>
                        <button className="p-2 bg-black/30 backdrop-blur rounded-full transition-colors">
                            <Heart size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Profile Overview (Overlapping card) */}
            <div className="px-4 -mt-16 relative z-20">
                <div className="bg-white rounded-t-3xl rounded-b-xl shadow-md border-x border-t border-slate-100 p-5">
                    {/* Chips */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="bg-slate-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                            Técnico
                        </span>
                        <span className="bg-white border border-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Briefcase size={12} /> {professional.trade}
                        </span>
                        <span className="bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2.5 py-1 rounded-full">
                            Disponible
                        </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-xl font-black text-slate-900">{professional.trade} profesional - {professional.name}</h1>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3 mt-2">
                        <div className="flex">{renderStars(parseFloat(avgRating))}</div>
                        <span className="text-slate-800 font-bold text-sm">{avgRating}</span>
                        <span className="text-slate-400 text-xs">({reviews.length} valoraciones)</span>
                    </div>

                    <div className="flex items-center gap-4 text-slate-500 text-xs mt-3">
                        <span className="flex items-center gap-1"><MapPin size={14}/> Bahía Blanca</span>
                        <span className="flex items-center gap-1"><Clock size={14}/> Activo hoy</span>
                    </div>
                </div>
            </div>

            <div className="px-4 mt-3 space-y-4">
                {/* Description */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h2 className="font-bold text-slate-900 text-sm mb-3">Descripción</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {professional.description}
                    </p>
                </div>

                {/* Contact Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h2 className="font-bold text-slate-900 text-sm mb-4">Contacto</h2>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-700 text-sm">
                            <User size={18} className="text-slate-400" />
                            <span className="font-medium">{professional.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700 text-sm">
                            <Mail size={18} className="text-slate-400" />
                            <span className="font-medium">contacto@{professional.name.toLowerCase().replace(' ', '')}.com</span>
                        </div>
                        
                        {socialLinks.whatsapp ? (
                            <div className="bg-emerald-50 text-emerald-700 rounded-xl p-3 flex items-center gap-3 border border-emerald-100">
                                <MessageCircle size={18} className="text-emerald-500" />
                                <span className="font-bold">{whatsappNumber}</span>
                            </div>
                        ) : null}

                        {/* Real Social Links */}
                        <div className="flex flex-col gap-2 pt-2">
                            {socialLinks.instagram ? (
                                <a href={`https://instagram.com/${socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl p-3 flex items-center gap-3 border border-pink-100 transition-colors">
                                    <Instagram size={18} className="text-pink-500" />
                                    <span className="font-medium">@{socialLinks.instagram}</span>
                                </a>
                            ) : null}
                            {socialLinks.facebook ? (
                                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl p-3 flex items-center gap-3 border border-blue-100 transition-colors">
                                    <Facebook size={18} className="text-blue-500" />
                                    <span className="font-medium">Perfil de Facebook</span>
                                </a>
                            ) : null}
                        </div>

                        {/* WhatsApp CTA Button */}
                        {socialLinks.whatsapp && (
                            <button 
                                onClick={handleWhatsAppClick}
                                className="w-full mt-2 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md text-white"
                                style={{ backgroundColor: '#25D366', boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)' }}
                            >
                                <MessageCircle size={18} />
                                Contactar por WhatsApp
                            </button>
                        )}
                    </div>
                </div>

                {/* Gallery (Max 10) */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h2 className="font-bold text-slate-900 text-sm mb-4">Trabajos realizados ({allPhotos.length})</h2>
                    {portfolioLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 size={24} className="text-emerald-500 animate-spin" />
                        </div>
                    ) : allPhotos.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                            {allPhotos.map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                                    <img src={img} alt="Trabajo" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-sm text-center py-4">No hay fotos publicadas aún.</p>
                    )}
                </div>

                {/* Reviews */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
                        <Star size={14} className="text-emerald-500 fill-emerald-500" />
                        Valoraciones
                    </h2>

                    {reviewsLoading ? (
                        <Loader2 size={24} className="text-emerald-500 animate-spin mx-auto my-6" />
                    ) : (
                        <div className="space-y-4">
                            {reviews.map(review => (
                                <div key={review.id} className="border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-slate-900 text-xs">{review.clientName}</h4>
                                        <span className="text-[10px] text-slate-400">{formatDate(review.createdAt)}</span>
                                    </div>
                                    <div className="flex mb-2">{renderStars(review.rating)}</div>
                                    <p className="text-xs text-slate-600 leading-relaxed">{review.comment}</p>
                                </div>
                            ))}

                            {reviews.length === 0 && (
                                <p className="text-slate-400 text-sm text-center py-4">Aún no hay valoraciones.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
