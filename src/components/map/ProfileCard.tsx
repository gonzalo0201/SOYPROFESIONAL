import { Star, CheckCircle, MessageCircle, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ProfessionalDisplay } from '../../hooks/useProfessionals';
import clsx from 'clsx';

interface ProfileCardProps {
    professional: ProfessionalDisplay;
    onClose: () => void;
}

export function ProfileCard({ professional, onClose }: ProfileCardProps) {
    const navigate = useNavigate();

    return (
        <div className={clsx(
            "absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 z-[500] animate-in slide-in-from-bottom-5 fade-in duration-300 border",
            professional.isBoosted ? "border-amber-200 ring-4 ring-amber-500/10" : "border-transparent"
        )}>
            {professional.isBoosted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1">
                    <Flame size={10} fill="currentColor" />
                    PROFESIONAL DESTACADO
                </div>
            )}
            <div className="flex justify-between items-start mb-3">
                <div
                    className="flex gap-3 cursor-pointer active:opacity-80 transition-opacity flex-1"
                    onClick={() => navigate(`/professional/${professional.id}`)}
                >
                    <img
                        src={professional.image}
                        alt={professional.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-slate-100"
                    />
                    <div>
                        <div className="flex items-center gap-1">
                            <h3 className="font-bold text-slate-900">{professional.name}</h3>
                            {professional.isVerified && (
                                <CheckCircle size={16} className="text-secondary fill-secondary text-white" />
                            )}
                        </div>
                        <p className="text-sm text-slate-500 font-medium">{professional.trade}</p>
                        <div className="flex items-center gap-1 mt-1">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-bold text-slate-700">{professional.rating}</span>
                            <span className="text-xs text-slate-400">({professional.reviews})</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1">
                    ✕
                </button>
            </div>

            {professional.status && (
                <div className="mb-4 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2 border border-emerald-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    "{professional.status}"
                </div>
            )}

            <div className="flex gap-2">
                <button className="flex-1 bg-slate-800 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
                    <MessageCircle size={18} />
                    Mensaje
                </button>
                <button className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
                    Solicitar
                </button>
            </div>
        </div>
    );
}
