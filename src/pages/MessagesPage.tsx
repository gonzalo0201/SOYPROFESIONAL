import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_CHATS = [
    {
        id: 1,
        name: 'Carlos Mendoza',
        role: 'Gasista',
        lastMessage: 'Sí, puedo pasar mañana a las 10hs.',
        time: '10:30',
        unread: 2,
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop'
    },
    {
        id: 2,
        name: 'Ana Rodríguez',
        role: 'Electricista',
        lastMessage: 'Dale, avisame cualquier cosa.',
        time: 'Ayer',
        unread: 0,
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
    }
];

export function MessagesPage() {
    const hasMessages = MOCK_CHATS.length > 0;

    return (
        <div className="bg-slate-50 min-h-full flex flex-col">
            <div className="bg-white px-6 py-5 border-b border-slate-100">
                <h1 className="text-2xl font-bold text-slate-900">Mensajes</h1>
            </div>

            <div className="flex-1 p-4">
                {!hasMessages ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 mt-20">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle size={32} />
                        </div>
                        <p className="font-medium">Sin mensajes aún</p>
                        <p className="text-sm mt-1">Tus conversaciones aparecerán acá.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {MOCK_CHATS.map(chat => (
                            <Link key={chat.id} to={`/chat/${chat.id}`} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 active:scale-[0.98] transition-transform block">
                                <img src={chat.image} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h3 className="font-bold text-slate-900 text-sm truncate">{chat.name}</h3>
                                        <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-1.5 py-0.5 rounded-md">{chat.time}</span>
                                    </div>
                                    <p className="text-xs text-emerald-600 font-medium mb-1">{chat.role}</p>
                                    <p className="text-sm text-slate-600 truncate">{chat.lastMessage}</p>
                                </div>
                                {chat.unread > 0 && (
                                    <div className="flex flex-col justify-center">
                                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm shadow-emerald-500/30">
                                            {chat.unread}
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
