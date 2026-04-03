import { useState, useEffect } from 'react';
import { Download, X, Share, Plus } from 'lucide-react';
import clsx from 'clsx';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSGuide, setShowIOSGuide] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Check if dismissed recently
        const dismissed = localStorage.getItem('install_prompt_dismissed');
        if (dismissed) {
            const dismissedAt = parseInt(dismissed, 10);
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - dismissedAt < sevenDays) return;
        }

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
        const isInStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;
        setIsIOS(isIOSDevice && !isInStandalone);

        if (isIOSDevice && !isInStandalone) {
            // Show native-style banner for iOS after 3 seconds
            setTimeout(() => setShowBanner(true), 3000);
            return;
        }

        // Android / Chrome
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setTimeout(() => setShowBanner(true), 2000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (isIOS) {
            setShowIOSGuide(true);
            return;
        }

        if (!deferredPrompt) return;

        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowBanner(false);
            setIsInstalled(true);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        setShowIOSGuide(false);
        localStorage.setItem('install_prompt_dismissed', Date.now().toString());
    };

    if (isInstalled || !showBanner) return null;

    return (
        <>
            {/* Main install banner */}
            <div className={clsx(
                "fixed bottom-24 left-4 right-4 z-[60] transition-all duration-300",
                showBanner ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            )}>
                <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-4 relative overflow-hidden">
                    {/* Glow effect */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex items-center gap-3 relative z-10">
                        {/* App icon */}
                        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                            <Download size={22} className="text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-sm leading-tight">
                                Instalá SOYPROFESIONAL
                            </h3>
                            <p className="text-slate-400 text-xs mt-0.5 leading-snug">
                                Accedé más rápido desde tu pantalla de inicio
                            </p>
                        </div>

                        {/* Install button */}
                        <button
                            onClick={handleInstall}
                            className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xs shrink-0 active:scale-95 transition-transform shadow-md shadow-emerald-500/20"
                        >
                            Instalar
                        </button>

                        {/* Close */}
                        <button
                            onClick={handleDismiss}
                            className="text-slate-500 hover:text-slate-300 p-1 shrink-0"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* iOS Guide Modal */}
            {showIOSGuide && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-end justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 pb-8 animate-in slide-in-from-bottom">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-slate-900 text-lg">Instalá la app</h3>
                            <button onClick={handleDismiss} className="text-slate-400 p-1">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                                    <Share size={18} className="text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 text-sm">1. Tocá el botón Compartir</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        El ícono de compartir en la barra de Safari (cuadrado con flecha)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                                    <Plus size={18} className="text-emerald-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 text-sm">2. "Agregar a pantalla de inicio"</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Desplazá hacia abajo y seleccioná esta opción
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                                    <Download size={18} className="text-amber-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 text-sm">3. Tocá "Agregar"</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        ¡Listo! La app aparecerá en tu pantalla como cualquier otra
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleDismiss}
                            className="w-full mt-6 bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-transform"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
