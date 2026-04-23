import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Star, MessageCircle, UserCheck, Shield,
    Clock, Bell, Trash2, Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { NotificationRow } from '../lib/database.types';

type NotificationType = NotificationRow['type'];

function getNotificationIcon(type: NotificationType) {
    switch (type) {
        case 'review': return { icon: Star, bg: 'bg-emerald-500', color: 'text-emerald-500' };
        case 'contact': return { icon: MessageCircle, bg: 'bg-green-500', color: 'text-green-500' };
        case 'follow': return { icon: UserCheck, bg: 'bg-teal-500', color: 'text-teal-500' };
        case 'verification': return { icon: Shield, bg: 'bg-cyan-600', color: 'text-cyan-600' };
        case 'system': return { icon: Bell, bg: 'bg-slate-500', color: 'text-slate-500' };
    }
}

type FilterType = 'all' | 'unread';

function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Hace un momento';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} hs`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    return date.toLocaleDateString();
}

export function NotificationsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<NotificationRow[]>([]);
    const [filter, setFilter] = useState<FilterType>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setNotifications(data);
            }
            setLoading(false);
        };

        fetchNotifications();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('notifications_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setNotifications(prev => [payload.new as NotificationRow, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new as NotificationRow : n));
                    } else if (payload.eventType === 'DELETE') {
                        setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const unreadCount = notifications.filter(n => !n.is_read).length;
    const filtered = filter === 'unread'
        ? notifications.filter(n => !n.is_read)
        : notifications;

    const markAllRead = async () => {
        if (!user) return;
        
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
    };

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);
    };

    const removeNotification = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.filter(n => n.id !== id));
        
        await supabase
            .from('notifications')
            .delete()
            .eq('id', id);
    };

    const handleNotificationClick = (notif: NotificationRow) => {
        if (!notif.is_read) {
            markAsRead(notif.id);
        }
        if (notif.action_url) {
            navigate(notif.action_url);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col pb-24">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-slate-100 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-slate-900">Notificaciones</h1>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="text-emerald-600 text-xs font-bold px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 active:scale-95 transition-transform"
                        >
                            Marcar todas leídas
                        </button>
                    )}
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={clsx(
                            "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                            filter === 'all'
                                ? "bg-slate-800 text-white"
                                : "bg-slate-100 text-slate-600"
                        )}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={clsx(
                            "px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5",
                            filter === 'unread'
                                ? "bg-slate-800 text-white"
                                : "bg-slate-100 text-slate-600"
                        )}
                    >
                        No leídas
                        {unreadCount > 0 && (
                            <span className={clsx(
                                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black",
                                filter === 'unread'
                                    ? "bg-emerald-400 text-white"
                                    : "bg-emerald-500 text-white"
                            )}>
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-emerald-500" size={32} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Bell size={32} className="text-slate-300" />
                        </div>
                        <p className="font-semibold text-slate-500">
                            {filter === 'unread' ? 'No tenés notificaciones sin leer' : 'Sin notificaciones'}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                            {filter === 'unread' ? '¡Estás al día! 🎉' : 'Las notificaciones aparecerán acá'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filtered.map(notif => {
                            const { icon: TypeIcon, bg } = getNotificationIcon(notif.type);
                            return (
                                <div
                                    key={notif.id}
                                    className={clsx(
                                        "flex gap-3 px-4 py-4 transition-colors cursor-pointer relative group",
                                        !notif.is_read ? "bg-emerald-50/50" : "bg-white hover:bg-slate-50"
                                    )}
                                    onClick={() => handleNotificationClick(notif)}
                                >
                                    {!notif.is_read && (
                                        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-500 rounded-full" />
                                    )}

                                    <div className="shrink-0 relative">
                                        {notif.avatar ? (
                                            <div className="relative">
                                                <img
                                                    src={notif.avatar}
                                                    alt=""
                                                    className="w-12 h-12 rounded-full object-cover bg-slate-100"
                                                />
                                                <div className={clsx(
                                                    "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white",
                                                    bg
                                                )}>
                                                    <TypeIcon size={10} className="text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={clsx(
                                                "w-12 h-12 rounded-full flex items-center justify-center",
                                                bg
                                            )}>
                                                <TypeIcon size={22} className="text-white" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className={clsx(
                                                "text-sm leading-tight",
                                                !notif.is_read ? "font-bold text-slate-900" : "font-semibold text-slate-700"
                                            )}>
                                                {notif.title}
                                            </h3>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 whitespace-nowrap">
                                                    <Clock size={10} />
                                                    {formatTimeAgo(notif.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                        <p className={clsx(
                                            "text-xs mt-0.5 leading-relaxed line-clamp-2",
                                            !notif.is_read ? "text-slate-600" : "text-slate-500"
                                        )}>
                                            {notif.body}
                                        </p>
                                    </div>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                                        className="shrink-0 text-slate-400 hover:text-red-500 active:text-red-600 transition-colors p-2 -mr-1 self-center rounded-full active:bg-red-50"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
