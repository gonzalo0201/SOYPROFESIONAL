import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Message } from '../lib/database.types';

type PermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported';

interface NotificationContextType {
    permission: PermissionStatus;
    isSupported: boolean;
    isPushEnabled: boolean;
    showPrompt: boolean;
    unreadTotal: number;
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
    const { user } = useAuth();
    const [permission, setPermission] = useState<PermissionStatus>('default');
    const [isSupported, setIsSupported] = useState(false);
    const [isPushEnabled, setIsPushEnabled] = useState(true);
    const [showPrompt, setShowPrompt] = useState(false);
    const [unreadTotal, setUnreadTotal] = useState(0);
    const activeConversationRef = useRef<string | null>(null);
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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

    // ============================================
    // REAL-TIME MESSAGE NOTIFICATIONS
    // ============================================

    // Fetch initial unread count
    useEffect(() => {
        if (!user) {
            setUnreadTotal(0);
            return;
        }

        async function fetchUnread() {
            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', user!.id)
                .eq('read', false);

            setUnreadTotal(count || 0);
        }

        fetchUnread();
    }, [user]);

    // Subscribe to new messages for the current user → send local notification
    useEffect(() => {
        if (!user) return;

        // Clean up previous channel
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
        }

        const channel = supabase
            .channel(`global-messages:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${user.id}`,
                },
                async (payload) => {
                    const msg = payload.new as Message;

                    // Update unread count
                    setUnreadTotal(prev => prev + 1);

                    // Don't notify if the user is looking at that conversation
                    if (activeConversationRef.current === msg.conversation_id) {
                        return;
                    }

                    // Don't notify if push is disabled
                    if (!isPushEnabled) return;

                    // Get sender's name
                    let senderName = 'Alguien';
                    const { data: senderProfile } = await supabase
                        .from('profiles')
                        .select('name')
                        .eq('id', msg.sender_id)
                        .single();

                    if (senderProfile) {
                        senderName = senderProfile.name;
                    }

                    // Send local notification via service worker
                    if (permission === 'granted' && 'serviceWorker' in navigator) {
                        try {
                            const registration = await navigator.serviceWorker.ready;
                            await registration.showNotification(`💬 ${senderName}`, {
                                body: msg.content.length > 100
                                    ? msg.content.substring(0, 97) + '...'
                                    : msg.content,
                                icon: '/icons/icon-512.png',
                                badge: '/icons/icon-512.png',
                                tag: `message-${msg.conversation_id}`,
                                renotify: true,
                                data: {
                                    url: `/chat/${msg.conversation_id}`,
                                    conversationId: msg.conversation_id,
                                },
                                vibrate: [200, 100, 200],
                            } as NotificationOptions);
                        } catch (err) {
                            console.error('[Notifications] Error showing notification:', err);
                        }
                    }
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
            channelRef.current = null;
        };
    }, [user, isPushEnabled, permission]);

    // Expose a way for ChatPage to tell us which conversation is active
    // This prevents notifications for the conversation the user is currently viewing
    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden) {
                // User switched tabs / minimized — keep tracking
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, []);

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

    // Make the active conversation setter available globally
    useEffect(() => {
        (window as any).__setActiveConversation = (id: string | null) => {
            activeConversationRef.current = id;
        };
        return () => {
            delete (window as any).__setActiveConversation;
        };
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                permission,
                isSupported,
                isPushEnabled,
                showPrompt,
                unreadTotal,
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

/**
 * Call this from ChatPage to mark which conversation is currently active
 * This prevents sending notifications for messages the user is already viewing
 */
export function setActiveConversation(conversationId: string | null) {
    if ((window as any).__setActiveConversation) {
        (window as any).__setActiveConversation(conversationId);
    }
}
