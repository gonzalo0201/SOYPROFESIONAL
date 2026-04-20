import { Home, Search, PlusCircle, User } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import clsx from 'clsx';

const navItems = [
    { name: 'Inicio', icon: Home, path: '/' },
    { name: 'Explorar', icon: Search, path: '/search' },
    { name: 'Publicar', icon: PlusCircle, path: '/post' },
    { name: 'Perfil', icon: User, path: '/profile' },
];

export function BottomNav() {
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around z-50">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

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
                        </div>
                        <span className="text-[10px] font-medium">{item.name}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
