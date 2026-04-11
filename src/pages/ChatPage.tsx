import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Phone, MoreVertical, CheckCheck, Clock, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../hooks/useChat';
import { setActiveConversation } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';

interface ChatContact {
    id: string;
    name: string;
    role: string;
    image: string;
    isOnline: boolean;
}

export function ChatPage() {
    const { chatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [contact, setContact] = useState<ChatContact | null>(null);
    const [receiverId, setReceiverId] = useState<string | undefined>();
    const [isLoadingContact, setIsLoadingContact] = useState(true);

    // Load conversation info and find the other participant
    useEffect(() => {
        if (!chatId || !user) return;

        async function loadConversationInfo() {
            setIsLoadingContact(true);

            // Get conversation details
            const { data: conv, error } = await supabase
                .from('conversations')
                .select('*')
                .eq('id', chatId)
                .single();

            if (error || !conv) {
                console.error('Conversation not found:', error);
                setIsLoadingContact(false);
                return;
            }

            // Determine the other participant
            const otherUserId = conv.participant_1 === user!.id
                ? conv.participant_2
                : conv.participant_1;

            setReceiverId(otherUserId);

            // Get their profile
            const { data: otherProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', otherUserId)
                .single();

            setContact({
                id: otherUserId,
                name: otherProfile?.name || 'Usuario',
                role: otherProfile?.role === 'professional' ? 'Profesional' : 'Cliente',
                image: otherProfile?.avatar_url || `https://ui-avatars.com/api/?name=U&background=10b981&color=fff`,
                isOnline: true, // Simplified - could use presence channels later
            });

            setIsLoadingContact(false);
        }

        loadConversationInfo();
    }, [chatId, user]);

    // Use the chat hook
    const { messages, isLoading: isLoadingMessages, sendMessage, isSending } = useChat(
        chatId,
        user?.id,
        receiverId
    );

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Tell NotificationContext which conversation we're viewing
    useEffect(() => {
        if (chatId) {
            setActiveConversation(chatId);
        }
        return () => {
            setActiveConversation(null);
        };
    }, [chatId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        const text = newMessage;
        setNewMessage('');
        await sendMessage(text);
    };

    // Loading state
    if (isLoadingContact || isLoadingMessages) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-emerald-500 animate-spin" />
                    <p className="text-slate-400 text-sm">Cargando chat...</p>
                </div>
            </div>
        );
    }

    if (!contact) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <p className="text-slate-400 mb-4">Chat no encontrado</p>
                    <button
                        onClick={() => navigate('/messages')}
                        className="text-emerald-600 font-bold text-sm"
                    >
                        Volver a mensajes
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-100 min-h-screen flex flex-col">
            {/* Header */}
            <div className="bg-slate-800 text-white px-3 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-md">
                <button onClick={() => navigate('/messages')} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft size={22} />
                </button>

                <div
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => navigate(`/professional/${contact.id}`)}
                >
                    <div className="relative">
                        <img src={contact.image} alt={contact.name} className="w-10 h-10 rounded-full object-cover border-2 border-white/20" />
                        {contact.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-800"></div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-sm truncate">{contact.name}</h2>
                        <p className="text-[11px] text-slate-300">
                            {contact.isOnline ? '🟢 En línea' : 'Desconectado'}
                        </p>
                    </div>
                </div>

                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <Phone size={18} />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <MoreVertical size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1" style={{ paddingBottom: '80px' }}>
                {/* Date separator */}
                <div className="flex justify-center mb-4">
                    <span className="bg-white/80 backdrop-blur-sm text-slate-500 text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">
                        Hoy
                    </span>
                </div>

                {messages.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Send size={24} className="text-emerald-500" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">¡Iniciá la conversación!</p>
                        <p className="text-slate-400 text-xs mt-1">Enviá un mensaje a {contact.name}</p>
                    </div>
                )}

                {messages.map((msg, index) => {
                    const showAvatar = !msg.isOwn && (index === 0 || messages[index - 1]?.isOwn);
                    const isLastInGroup = index === messages.length - 1 || messages[index + 1]?.isOwn !== msg.isOwn;

                    return (
                        <div
                            key={msg.id}
                            className={clsx(
                                "flex gap-2",
                                msg.isOwn ? "justify-end" : "justify-start",
                                isLastInGroup ? "mb-3" : "mb-0.5"
                            )}
                        >
                            {/* Avatar for received messages */}
                            {!msg.isOwn && (
                                <div className="w-7 shrink-0">
                                    {showAvatar && (
                                        <img
                                            src={contact.image}
                                            alt={contact.name}
                                            className="w-7 h-7 rounded-full object-cover"
                                        />
                                    )}
                                </div>
                            )}

                            {/* Bubble */}
                            <div
                                className={clsx(
                                    "max-w-[75%] px-3.5 py-2 shadow-sm",
                                    msg.isOwn
                                        ? clsx(
                                            "bg-emerald-500 text-white",
                                            isLastInGroup ? "rounded-2xl rounded-br-md" : "rounded-2xl"
                                        )
                                        : clsx(
                                            "bg-white text-slate-800",
                                            isLastInGroup ? "rounded-2xl rounded-bl-md" : "rounded-2xl"
                                        )
                                )}
                            >
                                <p className="text-[13px] leading-relaxed">{msg.content}</p>
                                <div className={clsx(
                                    "flex items-center justify-end gap-1 mt-0.5",
                                    msg.isOwn ? "text-emerald-100" : "text-slate-400"
                                )}>
                                    <span className="text-[10px]">{msg.time}</span>
                                    {msg.isOwn && (
                                        msg.id.startsWith('temp-')
                                            ? <Clock size={10} />
                                            : <CheckCheck size={12} className={msg.read ? 'text-blue-200' : ''} />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-3 py-2.5 z-20">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribí un mensaje..."
                        className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-slate-50 transition-all placeholder:text-slate-400"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className={clsx(
                            "p-2.5 rounded-full transition-all",
                            newMessage.trim() && !isSending
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95"
                                : "bg-slate-100 text-slate-300"
                        )}
                    >
                        {isSending ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Send size={18} />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
