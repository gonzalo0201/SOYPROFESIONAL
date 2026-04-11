import { MessageCircle, Loader2, PenSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../hooks/useConversations';

function formatTime(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) {
        return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

export function MessagesPage() {
    const { user } = useAuth();
    const { conversations, isLoading } = useConversations(user?.id);

    return (
        <div className="bg-slate-50 min-h-full flex flex-col">
            <div className="bg-white px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Mensajes</h1>
                <Link
                    to="/search"
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                    title="Nueva conversación"
                >
                    <PenSquare size={20} />
                </Link>
            </div>

            <div className="flex-1 p-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center mt-20 gap-3">
                        <Loader2 size={28} className="text-emerald-500 animate-spin" />
                        <p className="text-slate-400 text-sm">Cargando conversaciones...</p>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 mt-20">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle size={32} />
                        </div>
                        <p className="font-medium">Sin mensajes aún</p>
                        <p className="text-sm mt-1">Tus conversaciones aparecerán acá.</p>
                        <Link
                            to="/search"
                            className="mt-4 bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-emerald-600 transition-colors"
                        >
                            Buscar profesionales
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {conversations.map(conv => (
                            <Link
                                key={conv.id}
                                to={`/chat/${conv.id}`}
                                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 active:scale-[0.98] transition-transform block"
                            >
                                <div className="relative">
                                    <img
                                        src={conv.otherUser.avatar}
                                        alt={conv.otherUser.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    {/* Online indicator - simplified for now */}
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h3 className="font-bold text-slate-900 text-sm truncate">
                                            {conv.otherUser.name}
                                        </h3>
                                        <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-1.5 py-0.5 rounded-md shrink-0 ml-2">
                                            {formatTime(conv.lastMessageAt)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-emerald-600 font-medium mb-1">
                                        {conv.otherUser.role === 'professional' ? 'Profesional' : 'Cliente'}
                                    </p>
                                    <p className="text-sm text-slate-600 truncate">
                                        {conv.lastMessage || 'Conversación iniciada'}
                                    </p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <div className="flex flex-col justify-center">
                                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm shadow-emerald-500/30">
                                            {conv.unreadCount}
                                        </div>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
