import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Star, MessageCircle, UserCheck, Shield,
    Clock, Bell, Trash2
} from 'lucide-react';
import clsx from 'clsx';

type NotificationType = 'review' | 'contact' | 'follow' | 'verification' | 'system';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    avatar?: string;
    time: string;
    isRead: boolean;
    actionUrl?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'review',
        title: 'Nueva reseña ⭐',
        body: 'María García te dejó una reseña de 5 estrellas: "Excelente profesional, muy puntual"',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
        time: 'Hace 15 min',
        isRead: false,
        actionUrl: '/professional/1',
    },
    {
        id: '2',
        type: 'contact',
        title: 'Te contactaron por WhatsApp',
        body: 'Carlos Mendoza vio tu perfil y te contactó por WhatsApp',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
        time: 'Hace 30 min',
        isRead: false,
    },
    {
        id: '3',
        type: 'follow',
        title: 'Nuevo favorito',
        body: 'Ana Rodríguez agregó tu perfil a sus favoritos',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
        time: 'Hace 2 hs',
        isRead: false,
    },
    {
        id: '4',
        type: 'system',
        title: '¡Bienvenido a SoyProfesional!',
        body: 'Completá tu perfil para empezar a aparecer en las búsquedas de tu zona.',
        time: 'Ayer',
        isRead: true,
        actionUrl: '/edit-profile',
    },
    {
        id: '5',
        type: 'review',
        title: 'Solicitud de reseña',
        body: 'Pedro Suárez quiere dejarte una reseña por tu trabajo de plomería',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
        time: 'Hace 5 hs',
        isRead: true,
    },
    {
        id: '6',
        type: 'verification',
        title: 'Verificación pendiente',
        body: 'Subí una foto de tu matrícula o certificado para verificar tu cuenta.',
        time: 'Hace 2 días',
        isRead: true,
    },
];

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

export function NotificationsPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [filter, setFilter] = useState<FilterType>('all');

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const filtered = filter === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleNotificationClick = (notif: Notification) => {
        markAsRead(notif.id);
        if (notif.actionUrl) {
            navigate(notif.actionUrl);
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
                {filtered.length === 0 ? (
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
                                        !notif.isRead ? "bg-emerald-50/50" : "bg-white hover:bg-slate-50"
                                    )}
                                    onClick={() => handleNotificationClick(notif)}
                                >
                                    {!notif.isRead && (
                                        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-500 rounded-full" />
                                    )}

                                    <div className="shrink-0 relative">
                                        {notif.avatar ? (
                                            <div className="relative">
                                                <img
                                                    src={notif.avatar}
                                                    alt=""
                                                    className="w-12 h-12 rounded-full object-cover"
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
                                                !notif.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-700"
                                            )}>
                                                {notif.title}
                                            </h3>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {notif.time}
                                                </span>
                                            </div>
                                        </div>
                                        <p className={clsx(
                                            "text-xs mt-0.5 leading-relaxed line-clamp-2",
                                            !notif.isRead ? "text-slate-600" : "text-slate-500"
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
