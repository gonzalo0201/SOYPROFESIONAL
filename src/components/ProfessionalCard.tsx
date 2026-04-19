import { Star, CheckCircle, MapPin, Flame, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import type { ProfessionalDisplay } from '../hooks/useProfessionals';

interface ProfessionalCardProps {
    professional: ProfessionalDisplay;
}

export function ProfessionalCard({ professional: pro }: ProfessionalCardProps) {
    const navigate = useNavigate();

    return (
        <div 
            onClick={() => navigate(`/professional/${pro.id}`)}
            className={clsx(
                "p-5 rounded-2xl shadow-sm border relative overflow-hidden transition-all cursor-pointer hover:shadow-md",
                pro.isBoosted ? "bg-emerald-50/50 border-emerald-200" : "bg-white border-slate-100"
            )}
        >
            {pro.isBoosted && (
                <div className="absolute top-0 right-0 bg-gradient-to-bl from-emerald-100 to-white pl-3 pb-3 pt-1 pr-1 rounded-bl-3xl">
                    <div className="flex items-center gap-1 bg-emerald-100/50 px-2 py-0.5 rounded-full">
                        <Flame size={12} className="text-emerald-600 fill-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Destacado</span>
                    </div>
                </div>
            )}

            <div className="flex gap-4 mb-3">
                {/* Image & Status */}
                <div className="relative shrink-0">
                    <img src={pro.image} alt={pro.name} className={clsx(
                        "w-14 h-14 rounded-xl object-cover",
                        pro.isBoosted ? "ring-2 ring-emerald-400 ring-offset-2" : ""
                    )} />
                    <div className={clsx(
                        "absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full",
                        "bg-emerald-500"
                    )}></div>
                </div>

                {/* Header Info */}
                <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-lg leading-tight">{pro.name}</h3>
                        {pro.isVerified && <CheckCircle size={16} className="text-emerald-500 fill-transparent" strokeWidth={3} />}
                        {pro.isEarlyAdopter && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                Early Adopter
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 text-sm mt-0.5">{pro.trade}</p>
                    <div className="flex items-center gap-1 mt-1 text-sm">
                        <Star size={14} className="text-emerald-400 fill-current" />
                        <span className="font-bold text-slate-900">{pro.rating}</span>
                        <span className="text-slate-500">({pro.reviews})</span>
                        <span className="text-slate-300 mx-1">•</span>
                        <div className="flex items-center text-slate-400 text-xs">
                            <MapPin size={12} className="mr-0.5" />
                            <span>Bahía Blanca</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">
                {pro.description}
            </p>

            {/* Skills/Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
                {pro.skills && pro.skills.slice(0, 4).map(skill => (
                    <span key={skill} className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md">
                        {skill}
                    </span>
                ))}
            </div>

            {/* View Profile Action */}
            <div className="pt-3 border-t border-slate-100/80 flex justify-between items-center">
                <span className="text-emerald-600 font-bold text-xs uppercase tracking-wide">
                    Ver Perfil Completo
                </span>
                <div className="bg-emerald-50 p-2 rounded-full text-emerald-500">
                    <MessageCircle size={16} />
                </div>
            </div>
        </div>
    );
}
