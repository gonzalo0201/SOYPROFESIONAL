import { ArrowLeft, Check, Flame, Zap, Crown, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useState } from 'react';

export function BoostPage() {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState<string>('professional');

    const plans = [
        {
            id: 'starter',
            name: 'Starter',
            price: '$2.499',
            duration: '7 días',
            icon: Zap,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-50',
            features: ['Perfil destacado', 'Badge de impulso', 'Prioridad en búsquedas']
        },
        {
            id: 'professional',
            name: 'Profesional',
            price: '$3.999',
            duration: '15 días',
            icon: Flame,
            color: 'text-amber-500',
            bgColor: 'bg-amber-50',
            badge: 'POPULAR',
            features: ['Todo lo de Starter', 'Pin destacado en mapa', 'Estadísticas de visitas']
        },
        {
            id: 'premium',
            name: 'Premium',
            price: '$5.999',
            duration: '30 días',
            icon: Crown,
            color: 'text-purple-500',
            bgColor: 'bg-purple-50',
            features: ['Todo lo de Profesional', 'Aparición en home', 'Notificaciones a clientes']
        },
        {
            id: 'subscription',
            name: 'Suscripción',
            price: '$4.999',
            duration: 'Mensual',
            icon: RefreshCw,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50',
            features: ['Todo lo de Premium', 'Renovación automática', '15% descuento vs Premium']
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col pb-40">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-slate-100 flex items-center gap-4 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-900">Impulsar mi perfil</h1>
            </div>

            <div className="p-4 space-y-6">

                {/* Intro Card */}
                <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                            <Flame className="text-amber-500 fill-current" size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900">Más visibilidad, más clientes</h2>
                            <p className="text-slate-600 text-sm mt-1 mb-3">
                                Al impulsar tu perfil, aparecerás en los primeros lugares de búsqueda y destacarás en el mapa.
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <Check size={16} className="text-emerald-500" /> Valoraciones verificadas
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <Check size={16} className="text-emerald-500" /> Cancelá cuando quieras
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Plans List */}
                <div className="space-y-3">
                    <h3 className="font-bold text-slate-900 ml-1">Elegí tu plan</h3>

                    {plans.map(plan => (
                        <div
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={clsx(
                                "bg-white p-5 rounded-2xl border-2 transition-all relative cursor-pointer active:scale-[0.98]",
                                selectedPlan === plan.id ? "border-emerald-500 shadow-md ring-1 ring-emerald-500/20" : "border-slate-100 shadow-sm hover:border-slate-200"
                            )}
                        >
                            {plan.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm tracking-wide uppercase">
                                    {plan.badge}
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", plan.bgColor)}>
                                        <plan.icon className={plan.color} size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{plan.name}</h4>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-bold text-slate-900">{plan.price}</span>
                                            <span className="text-xs text-slate-500 font-medium">/ {plan.duration}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={clsx(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                    selectedPlan === plan.id ? "border-emerald-500" : "border-slate-200"
                                )}>
                                    {selectedPlan === plan.id && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                                </div>
                            </div>

                            <div className="space-y-2 pl-13 border-t border-slate-50 pt-3 mt-3">
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <Check size={12} className="text-emerald-500" strokeWidth={3} />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-20">
                <button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2">
                    <Flame size={20} fill="currentColor" className="text-white/90" />
                    Activar Impulso
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-2">
                    El impulso mejora tu visibilidad sin alterar calificaciones ni reseñas.
                </p>
            </div>
        </div>
    );
}
