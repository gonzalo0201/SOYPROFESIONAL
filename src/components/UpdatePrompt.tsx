import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export function UpdatePrompt() {
    const [showBanner, setShowBanner] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

    const detectUpdate = useCallback((registration: ServiceWorkerRegistration) => {
        // A new SW is waiting to activate
        if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setShowBanner(true);
        }

        // Listen for new SW entering the "waiting" state
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content is available, show banner
                    setWaitingWorker(newWorker);
                    setShowBanner(true);
                }
            });
        });
    }, []);

    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        // Check existing registration
        navigator.serviceWorker.ready.then((registration) => {
            detectUpdate(registration);
        });

        // Also listen to all registrations
        navigator.serviceWorker.getRegistration().then((registration) => {
            if (registration) {
                detectUpdate(registration);
            }
        });

        // Listen for the SW_UPDATED message (sent after activate)
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'SW_UPDATED') {
                // The new SW has taken control, reload to get fresh content
                window.location.reload();
            }
        };
        navigator.serviceWorker.addEventListener('message', handleMessage);

        // Periodically check for updates (every 60 minutes in production)
        const interval = setInterval(() => {
            navigator.serviceWorker.getRegistration().then((registration) => {
                if (registration) {
                    registration.update().catch(() => {
                        // Silent fail — user might be offline
                    });
                }
            });
        }, 60 * 60 * 1000); // 1 hour

        return () => {
            navigator.serviceWorker.removeEventListener('message', handleMessage);
            clearInterval(interval);
        };
    }, [detectUpdate]);

    const handleUpdate = () => {
        if (!waitingWorker) return;
        setIsUpdating(true);

        // Tell the waiting SW to activate
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });

        // The SW will send SW_UPDATED once it controls the page,
        // which triggers a reload above. As a fallback, reload after 3s.
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        // Re-show after 30 minutes if not updated
        setTimeout(() => {
            if (waitingWorker) setShowBanner(true);
        }, 30 * 60 * 1000);
    };

    if (!showBanner) return null;

    return (
        <div
            className={clsx(
                "fixed top-4 left-4 right-4 z-[9999] transition-all duration-500",
                showBanner
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-full opacity-0"
            )}
        >
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-2xl shadow-emerald-500/20 p-4 relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/5 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-center gap-3 relative z-10">
                    {/* Icon */}
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                        <Sparkles size={20} className="text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm leading-tight">
                            ¡Nueva versión disponible!
                        </h3>
                        <p className="text-emerald-100 text-[11px] mt-0.5 leading-snug">
                            Actualizá para obtener las últimas mejoras
                        </p>
                    </div>

                    {/* Update button */}
                    <button
                        onClick={handleUpdate}
                        disabled={isUpdating}
                        className="bg-white text-emerald-700 px-4 py-2 rounded-xl font-bold text-xs shrink-0 active:scale-95 transition-all shadow-md flex items-center gap-1.5 disabled:opacity-70"
                    >
                        {isUpdating ? (
                            <>
                                <RefreshCw size={14} className="animate-spin" />
                                <span>Actualizando...</span>
                            </>
                        ) : (
                            <>
                                <RefreshCw size={14} />
                                <span>Actualizar</span>
                            </>
                        )}
                    </button>

                    {/* Close */}
                    <button
                        onClick={handleDismiss}
                        className="text-white/60 hover:text-white p-1 shrink-0 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
