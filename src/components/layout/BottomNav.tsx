import { Map, Search, PlusCircle, MessageCircle, User } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import clsx from 'clsx';

const navItems = [
    { name: 'Mapa', icon: Map, path: '/' },
    { name: 'Buscar', icon: Search, path: '/search' },
    { name: 'Publicar', icon: PlusCircle, path: '/post' },
    { name: 'Mensajes', icon: MessageCircle, path: '/messages' },
    { name: 'Perfil', icon: User, path: '/profile' },
];

export function BottomNav() {
    const location = useLocation();
    const { unreadTotal } = useNotifications();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around z-50">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                const showBadge = item.path === '/messages' && unreadTotal > 0;

                return (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={clsx(
                            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative",
                            isActive ? "text-emerald-500" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <div className="relative">
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            {showBadge && (
                                <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-white px-1">
                                    {unreadTotal > 99 ? '99+' : unreadTotal}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium">{item.name}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
