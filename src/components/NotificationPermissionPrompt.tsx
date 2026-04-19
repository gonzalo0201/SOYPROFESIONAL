import { useNotifications } from '../contexts/NotificationContext';
import { Bell, BellRing, X, MessageCircle, Star, Flame, ShieldCheck } from 'lucide-react';

export function NotificationPermissionPrompt() {
    const { showPrompt, requestPermission, dismissPrompt, permission } = useNotifications();

    if (!showPrompt || permission !== 'default') return null;

    const handleAllow = async () => {
        await requestPermission();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] transition-opacity duration-300"
                onClick={dismissPrompt}
            />

            {/* Modal */}
            <div className="fixed inset-x-4 bottom-6 z-[10000] animate-[slideUpModal_0.4s_ease-out]">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md mx-auto border border-slate-100">

                    {/* Header with animation */}
                    <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-900 px-6 pt-8 pb-6 text-center relative overflow-hidden">
                        {/* Glow effects */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/15 rounded-full blur-2xl" />

                        {/* Bell animation */}
                        <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-4 backdrop-blur-sm border border-white/10">
                            <div className="animate-[bellRing_2s_ease-in-out_infinite]">
                                <BellRing size={36} className="text-emerald-400" />
                            </div>
                            {/* Notification dots */}
                            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-white/20 animate-bounce">
                                3
                            </span>
                        </div>

                        <h2 className="text-xl font-black text-white mb-1 relative z-10">
                            ¡No te pierdas nada!
                        </h2>
                        <p className="text-slate-300 text-sm relative z-10">
                            Activá las notificaciones para recibir alertas al instante
                        </p>

                        {/* Close button */}
                        <button
                            onClick={dismissPrompt}
                            className="absolute top-4 right-4 z-10 p-2 text-white/40 hover:text-white/80 transition-colors rounded-full hover:bg-white/10"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Benefits */}
                    <div className="px-6 py-5 space-y-3.5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                <MessageCircle size={18} className="text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Mensajes de clientes</p>
                                <p className="text-xs text-slate-500">Respondé rápido y cerrá más trabajos</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                                <Star size={18} className="text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Nuevas reseñas</p>
                                <p className="text-xs text-slate-500">Enteráte cuando te dejan una valoración</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                                <Flame size={18} className="text-orange-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Oportunidades de trabajo</p>
                                <p className="text-xs text-slate-500">Recibí alertas de solicitudes en tu zona</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 pb-6 space-y-2.5">
                        <button
                            onClick={handleAllow}
                            className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20"
                        >
                            <Bell size={18} />
                            Activar notificaciones
                        </button>
                        <button
                            onClick={dismissPrompt}
                            className="w-full text-slate-400 py-2.5 rounded-xl font-medium text-sm hover:text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            Ahora no
                        </button>
                    </div>

                    {/* Trust badge */}
                    <div className="border-t border-slate-100 px-6 py-3 flex items-center justify-center gap-1.5 bg-slate-50">
                        <ShieldCheck size={12} className="text-emerald-500" />
                        <span className="text-[10px] text-slate-400 font-medium">
                            Podés desactivarlas en cualquier momento desde tu perfil
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}

// Compact inline banner (alternative for denied state or reminder)
export function NotificationDeniedBanner() {
    const { permission, isSupported } = useNotifications();

    if (!isSupported || permission !== 'denied') return null;

    return (
        <div className="mx-4 mb-3 bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                <Bell size={16} className="text-orange-600" />
            </div>
            <div>
                <p className="text-sm font-bold text-orange-900">Notificaciones bloqueadas</p>
                <p className="text-xs text-orange-700 mt-0.5 leading-relaxed">
                    Las notificaciones están desactivadas. Para activarlas, andá a la configuración de tu navegador → Permisos → Notificaciones.
                </p>
            </div>
        </div>
    );
}
