import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

type PermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported';

interface NotificationContextType {
    permission: PermissionStatus;
    isSupported: boolean;
    isPushEnabled: boolean;
    showPrompt: boolean;
    requestPermission: () => Promise<boolean>;
    sendTestNotification: (type?: string) => void;
    dismissPrompt: () => void;
    togglePush: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// Test notification templates
const TEST_NOTIFICATIONS: Record<string, { title: string; body: string; tag: string; url: string }> = {
    message: {
        title: '💬 Nuevo mensaje',
        body: 'Carlos Mendoza: "Hola, ¿podrías pasar mañana a las 10hs?"',
        tag: 'message-test',
        url: '/messages',
    },
    review: {
        title: '⭐ Nueva reseña',
        body: 'María García te dejó una reseña de 5 estrellas. ¡Excelente trabajo!',
        tag: 'review-test',
        url: '/notifications',
    },
    boost: {
        title: '🔥 Tu perfil está en llamas',
        body: 'Tu perfil fue visto 47 veces esta semana. ¡Impulsalo para llegar a más clientes!',
        tag: 'boost-test',
        url: '/boost',
    },
    client: {
        title: '🙋 Nueva solicitud de servicio',
        body: 'Ana Rodríguez necesita un gasista en Bahía Blanca. ¿Estás disponible?',
        tag: 'client-test',
        url: '/messages',
    },
};

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [permission, setPermission] = useState<PermissionStatus>('default');
    const [isSupported, setIsSupported] = useState(false);
    const [isPushEnabled, setIsPushEnabled] = useState(true);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if notifications API is supported
        const supported = 'Notification' in window && 'serviceWorker' in navigator;
        setIsSupported(supported);

        if (supported) {
            setPermission(Notification.permission as PermissionStatus);

            // Load push preference
            const saved = localStorage.getItem('sp_push_enabled');
            if (saved !== null) setIsPushEnabled(saved === 'true');
        } else {
            setPermission('unsupported');
        }
    }, []);

    // Show the permission prompt after a delay if user hasn't decided yet
    useEffect(() => {
        if (!isSupported || permission !== 'default') return;

        // Check if user already dismissed the prompt recently
        const dismissed = localStorage.getItem('sp_notif_prompt_dismissed');
        if (dismissed) {
            const dismissedAt = parseInt(dismissed, 10);
            const threeDays = 3 * 24 * 60 * 60 * 1000;
            if (Date.now() - dismissedAt < threeDays) return;
        }

        // Show prompt after 5 seconds of app usage
        const timer = setTimeout(() => {
            setShowPrompt(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, [isSupported, permission]);

    // Listen for notification click messages from service worker
    useEffect(() => {
        if (!isSupported) return;

        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'NOTIFICATION_CLICK' && event.data?.url) {
                window.location.href = event.data.url;
            }
        };

        navigator.serviceWorker.addEventListener('message', handleMessage);
        return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
    }, [isSupported]);

    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!isSupported) return false;

        try {
            const result = await Notification.requestPermission();
            setPermission(result as PermissionStatus);
            setShowPrompt(false);

            if (result === 'granted') {
                localStorage.setItem('sp_push_enabled', 'true');
                setIsPushEnabled(true);

                // Register for push with the service worker
                const registration = await navigator.serviceWorker.ready;
                console.log('[Notifications] Permission granted, SW ready:', registration.scope);
                return true;
            }
            return false;
        } catch (err) {
            console.error('[Notifications] Permission request failed:', err);
            return false;
        }
    }, [isSupported]);

    const sendTestNotification = useCallback((type?: string) => {
        if (!isSupported || permission !== 'granted' || !isPushEnabled) return;

        // Pick a random template or use the specified type
        const keys = Object.keys(TEST_NOTIFICATIONS);
        const key = type || keys[Math.floor(Math.random() * keys.length)];
        const template = TEST_NOTIFICATIONS[key] || TEST_NOTIFICATIONS.message;

        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(template.title, {
                body: template.body,
                icon: '/icons/icon-512.png',
                badge: '/icons/icon-512.png',
                tag: template.tag,
                data: { url: template.url },
            } as NotificationOptions);
        });
    }, [isSupported, permission, isPushEnabled]);

    const dismissPrompt = useCallback(() => {
        setShowPrompt(false);
        localStorage.setItem('sp_notif_prompt_dismissed', Date.now().toString());
    }, []);

    const togglePush = useCallback(() => {
        const next = !isPushEnabled;
        setIsPushEnabled(next);
        localStorage.setItem('sp_push_enabled', String(next));
    }, [isPushEnabled]);

    return (
        <NotificationContext.Provider
            value={{
                permission,
                isSupported,
                isPushEnabled,
                showPrompt,
                requestPermission,
                sendTestNotification,
                dismissPrompt,
                togglePush,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>');
    return ctx;
}
