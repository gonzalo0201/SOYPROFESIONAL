import { Star, CheckCircle, MessageCircle, Phone, MapPin, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import type { ProfessionalDisplay } from '../hooks/useProfessionals';

interface ProfessionalCardProps {
    professional: ProfessionalDisplay;
}

export function ProfessionalCard({ professional: pro }: ProfessionalCardProps) {
    const navigate = useNavigate();

    return (
        <div className={clsx(
            "p-5 rounded-2xl shadow-sm border relative overflow-hidden transition-all",
            pro.isBoosted ? "bg-[#FFF8E1] border-amber-200" : "bg-white border-slate-200"
        )}>
            {pro.isBoosted && (
                <div className="absolute top-0 right-0 bg-gradient-to-bl from-amber-100 to-white pl-3 pb-3 pt-1 pr-1 rounded-bl-3xl">
                    <div className="flex items-center gap-1 bg-amber-100/50 px-2 py-0.5 rounded-full">
                        <Flame size={12} className="text-orange-500 fill-orange-500" />
                        <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wide">Destacado</span>
                    </div>
                </div>
            )}

            {/* Clickable area → Profile */}
            <div
                className="cursor-pointer active:opacity-80 transition-opacity"
                onClick={() => navigate(`/professional/${pro.id}`)}
            >

            <div className="flex gap-4 mb-3">
                {/* Image & Status */}
                <div className="relative shrink-0">
                    <img src={pro.image} alt={pro.name} className={clsx(
                        "w-14 h-14 rounded-xl object-cover",
                        pro.isBoosted ? "ring-2 ring-amber-400 ring-offset-2" : ""
                    )} />
                    <div className={clsx(
                        "absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full",
                        pro.isBoosted ? "bg-amber-500" : "bg-emerald-500"
                    )}></div>
                </div>

                {/* Header Info */}
                <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-lg leading-tight">{pro.name}</h3>
                        {pro.isVerified && <CheckCircle size={16} className="text-emerald-500 fill-transparent" strokeWidth={3} />}
                        {pro.isEarlyAdopter && (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                Early Adopter
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 text-sm mt-0.5">{pro.trade}</p>
                    <div className="flex items-center gap-1 mt-1 text-sm">
                        <Star size={14} className="text-amber-400 fill-current" />
                        <span className="font-bold text-slate-900">{pro.rating}</span>
                        <span className="text-slate-500">({pro.reviews})</span>
                        <span className="text-slate-300 mx-1">•</span>
                        <div className="flex items-center text-slate-400">
                            <MapPin size={12} className="mr-0.5" />
                            <span>2.3 km</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {pro.description}
            </p>

            {/* Skills/Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
                {pro.skills && pro.skills.map(skill => (
                    <span key={skill} className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-md">
                        {skill}
                    </span>
                ))}
            </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
                <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/chat/new/${pro.id}`); }}
                    className="flex-1 bg-slate-800 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-700 active:scale-95 transition-all"
                >
                    <MessageCircle size={18} />
                    Mensaje
                </button>
                <button className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
                    Solicitar servicio
                </button>
                <button className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-colors">
                    <Phone size={20} />
                </button>
            </div>
        </div>
    );
}
