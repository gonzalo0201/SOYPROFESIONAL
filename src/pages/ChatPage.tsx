import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Phone, MoreVertical, Image as ImageIcon, MapPin, CheckCheck, Clock, Star } from 'lucide-react';
import clsx from 'clsx';
import { useReviews } from '../contexts/ReviewContext';
import { ReviewRequestBubble } from '../components/reviews/ReviewRequestBubble';
import { ReviewModal } from '../components/reviews/ReviewModal';
import { MOCK_PROFESSIONALS } from '../data/mockUsers';

interface Message {
    id: number;
    text: string;
    time: string;
    isOwn: boolean;
    status: 'sent' | 'delivered' | 'read';
    image?: string;
    type?: 'text' | 'system';
}

interface ChatContact {
    id: number;
    name: string;
    role: string;
    image: string;
    isOnline: boolean;
    lastSeen?: string;
}

const MOCK_CONTACTS: Record<string, ChatContact> = {
    '1': {
        id: 1,
        name: 'Carlos Mendoza',
        role: 'Gasista Matriculado',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
        isOnline: true,
    },
    '2': {
        id: 2,
        name: 'Ana Rodríguez',
        role: 'Electricista',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        isOnline: false,
        lastSeen: 'Hace 2 horas',
    },
};

const MOCK_MESSAGES: Record<string, Message[]> = {
    '1': [
        { id: 1, text: 'Hola Carlos! Necesito un trabajo de gas en mi departamento. ¿Tenés disponibilidad esta semana?', time: '09:15', isOwn: true, status: 'read' },
        { id: 2, text: 'Hola! Sí, puedo pasar a revisar. ¿Qué tipo de trabajo necesitás?', time: '09:20', isOwn: false, status: 'read' },
        { id: 3, text: 'Es para instalar un calefón nuevo. Ya lo compré, y necesito la conexión de gas y el tiraje.', time: '09:22', isOwn: true, status: 'read' },
        { id: 4, text: 'Perfecto, eso lo hago sin problema. ¿Qué modelo de calefón es?', time: '09:25', isOwn: false, status: 'read' },
        { id: 5, text: 'Es un Orbis 14 litros, tiro balanceado.', time: '09:28', isOwn: true, status: 'read' },
        { id: 6, text: 'Muy bien, conozco ese modelo. El trabajo lleva unas 3 horas aproximadamente. Te puedo presupuestar $45.000 con materiales incluidos.', time: '09:35', isOwn: false, status: 'read' },
        { id: 7, text: '¿Incluye la certificación?', time: '09:40', isOwn: true, status: 'read' },
        { id: 8, text: 'Sí, incluye la certificación de gas. Soy gasista matriculado así que te hago la oblea y todo.', time: '09:42', isOwn: false, status: 'read' },
        { id: 9, text: 'Genial! Me parece bien el presupuesto. ¿Cuándo podrías venir?', time: '10:00', isOwn: true, status: 'read' },
        { id: 10, text: 'Sí, puedo pasar mañana a las 10hs.', time: '10:30', isOwn: false, status: 'read' },
        { id: 11, text: 'Te mando la ubicación 📍', time: '10:31', isOwn: true, status: 'delivered' },
    ],
    '2': [
        { id: 1, text: 'Hola Ana! Vi tu perfil en Oficios. Necesito cambiar unas llaves térmicas.', time: '15:00', isOwn: true, status: 'read' },
        { id: 2, text: 'Hola! Sí, claro. ¿Cuántas llaves térmicas necesitás cambiar?', time: '15:15', isOwn: false, status: 'read' },
        { id: 3, text: 'Son 4 llaves, un tablero chico de un monoambiente.', time: '15:20', isOwn: true, status: 'read' },
        { id: 4, text: 'Dale, avisame cualquier cosa.', time: '15:30', isOwn: false, status: 'read' },
    ],
};

export function ChatPage() {
    const { chatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES[chatId || '1'] || []);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const contact = MOCK_CONTACTS[chatId || '1'];
    const professional = MOCK_PROFESSIONALS.find(p => p.id === Number(chatId));

    const { requestReview, acceptReview, rejectReview, submitReview, getRequestsForChat, hasActiveRequest } = useReviews();

    const chatRequests = getRequestsForChat(Number(chatId));
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, chatRequests]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msg: Message = {
            id: messages.length + 1,
            text: newMessage.trim(),
            time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
            isOwn: true,
            status: 'sent',
        };

        setMessages(prev => [...prev, msg]);
        setNewMessage('');

        // Simulate response
        setTimeout(() => {
            const response: Message = {
                id: messages.length + 2,
                text: getAutoResponse(newMessage),
                time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
                isOwn: false,
                status: 'read',
            };
            setMessages(prev => [...prev, response]);
        }, 1500 + Math.random() * 2000);
    };

    const handleRequestReview = () => {
        if (!contact || hasActiveRequest(contact.id)) return;
        requestReview(contact.id, contact.name);

        // Add system message
        const sysMsg: Message = {
            id: messages.length + 1,
            text: `Solicitaste dejar una reseña a ${contact.name}`,
            time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
            isOwn: true,
            status: 'read',
            type: 'system',
        };
        setMessages(prev => [...prev, sysMsg]);
    };

    const handleAcceptReview = (requestId: string) => {
        acceptReview(requestId);
    };

    const handleRejectReview = (requestId: string) => {
        rejectReview(requestId);
    };

    const handleOpenReviewModal = (requestId: string) => {
        setActiveRequestId(requestId);
        setIsReviewModalOpen(true);
    };

    const handleSubmitReview = (rating: number, comment: string, tags: string[]) => {
        if (!activeRequestId) return;
        submitReview(activeRequestId, rating, comment, tags);
    };

    if (!contact) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-400">Chat no encontrado</p>
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
                            {contact.isOnline ? '🟢 En línea' : contact.lastSeen || 'Desconectado'}
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

                {messages.map((msg, index) => {
                    const showAvatar = !msg.isOwn && (index === 0 || messages[index - 1]?.isOwn);
                    const isLastInGroup = index === messages.length - 1 || messages[index + 1]?.isOwn !== msg.isOwn;

                    // System messages
                    if (msg.type === 'system') {
                        return (
                            <div key={msg.id} className="flex justify-center my-2">
                                <span className="bg-amber-50 text-amber-700 text-[11px] font-medium px-3 py-1.5 rounded-full border border-amber-100">
                                    ⭐ {msg.text}
                                </span>
                            </div>
                        );
                    }

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
                                {msg.image && (
                                    <img src={msg.image} alt="" className="rounded-xl mb-2 w-full" />
                                )}
                                <p className="text-[13px] leading-relaxed">{msg.text}</p>
                                <div className={clsx(
                                    "flex items-center justify-end gap-1 mt-0.5",
                                    msg.isOwn ? "text-emerald-100" : "text-slate-400"
                                )}>
                                    <span className="text-[10px]">{msg.time}</span>
                                    {msg.isOwn && (
                                        msg.status === 'sent'
                                            ? <Clock size={10} />
                                            : <CheckCheck size={12} className={msg.status === 'read' ? 'text-blue-200' : ''} />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Review Request Bubbles */}
                {chatRequests.map(request => (
                    <ReviewRequestBubble
                        key={request.id}
                        request={request}
                        isOwnRequest={true}
                        onAccept={() => handleAcceptReview(request.id)}
                        onReject={() => handleRejectReview(request.id)}
                        onWriteReview={() => handleOpenReviewModal(request.id)}
                    />
                ))}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-3 py-2.5 z-20">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <button type="button" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <ImageIcon size={20} />
                    </button>
                    <button type="button" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <MapPin size={20} />
                    </button>
                    {/* Review Request Button */}
                    <button
                        type="button"
                        onClick={handleRequestReview}
                        disabled={hasActiveRequest(contact.id)}
                        className={clsx(
                            "p-2 rounded-full transition-colors",
                            hasActiveRequest(contact.id)
                                ? "text-amber-300 cursor-not-allowed"
                                : "text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                        )}
                        title="Solicitar reseña"
                    >
                        <Star size={20} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribí un mensaje..."
                        className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-slate-50 transition-all placeholder:text-slate-400"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className={clsx(
                            "p-2.5 rounded-full transition-all",
                            newMessage.trim()
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95"
                                : "bg-slate-100 text-slate-300"
                        )}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>

            {/* Review Modal */}
            {professional && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    onSubmit={handleSubmitReview}
                    professionalName={professional.name}
                    professionalImage={professional.image}
                    professionalTrade={professional.trade}
                />
            )}
        </div>
    );
}

function getAutoResponse(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('hora') || lower.includes('cuando') || lower.includes('cuándo')) {
        return '¿Te parece bien mañana a la mañana? Tengo un hueco entre las 9 y las 12.';
    }
    if (lower.includes('precio') || lower.includes('presupuesto') || lower.includes('cuánto') || lower.includes('cuanto')) {
        return 'Tendría que pasar a ver el trabajo primero para darte un presupuesto exacto, ¿te parece?';
    }
    if (lower.includes('ubicación') || lower.includes('direc') || lower.includes('dónde') || lower.includes('donde')) {
        return 'Mandame la ubicación por acá y cuando vaya la busco en el GPS 📍';
    }
    if (lower.includes('gracias') || lower.includes('genial') || lower.includes('dale')) {
        return '¡De nada! Cualquier cosa avisame. 👍';
    }
    if (lower.includes('hola') || lower.includes('buenas')) {
        return '¡Hola! ¿En qué te puedo ayudar?';
    }
    return '¡Perfecto! Lo tengo en cuenta. ¿Algo más que necesites?';
}
