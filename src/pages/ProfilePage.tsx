import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, Shield, Star, ChevronRight, CheckCircle, LogOut, MapPin, Users, Flame, Bell, BellOff, Send, Loader2 } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

export function ProfilePage() {
    const { permission, isSupported, isPushEnabled, togglePush, requestPermission, sendTestNotification } = useNotifications();
    const { user, profile, isLoading, signOut } = useAuth();
    const navigate = useNavigate();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !user) {
            navigate('/login');
        }
    }, [isLoading, user, navigate]);

    const menuItems = [
        { icon: User, label: "Editar perfil", desc: "Foto, nombre, profesión", path: "/edit-profile" },
        { icon: MapPin, label: "Localización", desc: "Tiempo real, aproximada, fija", path: "/location-settings" },
        { icon: Users, label: "Mis Relevos", desc: "Colegas de confianza para derivar trabajos", path: "/relays" },
        { icon: Shield, label: "Verificación", desc: "Estado de tu verificación" },
        { icon: Star, label: "Mis reseñas", desc: "Ver y gestionar reseñas" },
        { icon: Settings, label: "Configuración", desc: "Cuenta, notificaciones" },
    ];

    const handleNotificationToggle = async () => {
        if (permission === 'default') {
            await requestPermission();
        } else if (permission === 'granted') {
            togglePush();
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="bg-slate-50 min-h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-emerald-500 animate-spin" />
                    <p className="text-slate-400 text-sm">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    // Use real data from Supabase, with fallbacks
    const userName = profile?.name || user?.user_metadata?.name || 'Usuario';
    const userEmail = profile?.email || user?.email || '';
    const userRole = profile?.role === 'professional' ? 'Profesional' : 'Cliente';
    const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=10b981&color=fff&bold=true`;
    const isVerified = profile?.role === 'professional'; // Simplified for now

    return (
        <div className="bg-slate-50 min-h-full pb-6">
            <header className="bg-slate-800 text-white p-6 pb-12 rounded-b-[2rem] shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full border-4 border-white/30 mb-4 overflow-hidden relative shadow-xl">
                        <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-white">{userName}</h1>
                        {isVerified && <CheckCircle className="text-emerald-400 fill-white" size={20} />}
                    </div>
                    <p className="text-slate-300 font-medium text-sm">{userRole}</p>
                    {userEmail && (
                        <p className="text-slate-400 text-xs mt-1">{userEmail}</p>
                    )}

                    {!isVerified && (
                        <button className="mt-4 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors">
                            Verificar mi cuenta
                        </button>
                    )}
                </div>

                {/* Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500 rounded-full blur-3xl"></div>
                    <div className="absolute top-20 -left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
                </div>
            </header>

            <div className="px-4 -mt-6 relative z-20">
                {/* Boost CTA */}
                <div className="mb-4">
                    <Link to="/boost" className="block bg-white rounded-2xl p-1 shadow-sm border border-slate-100 overflow-hidden group">
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl flex items-center justify-between border border-amber-100/50 group-active:scale-[0.98] transition-transform">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                                    <Flame size={20} fill="currentColor" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm leading-tight">Impulsar mi perfil</h3>
                                    <p className="text-[11px] text-amber-700 font-bold uppercase tracking-wide mt-0.5">Destacá y ganá más</p>
                                </div>
                            </div>
                            <div className="bg-white/60 p-1.5 rounded-full backdrop-blur-sm">
                                <ChevronRight size={18} className="text-amber-500" />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Notification Settings Card */}
                {isSupported && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4">
                        <div className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <Bell size={20} className="text-emerald-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900 text-sm">Notificaciones Push</h3>
                                    <p className="text-xs text-slate-500">
                                        {permission === 'granted'
                                            ? (isPushEnabled ? 'Activadas – Recibís alertas en tu celular' : 'Pausadas – No recibirás alertas')
                                            : permission === 'denied'
                                                ? 'Bloqueadas – Activálas desde config. del navegador'
                                                : 'Sin configurar – Activálas para no perderte nada'}
                                    </p>
                                </div>
                            </div>

                            {/* Toggle */}
                            <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <div className="flex items-center gap-2">
                                    {isPushEnabled && permission === 'granted' ? (
                                        <Bell size={16} className="text-emerald-500" />
                                    ) : (
                                        <BellOff size={16} className="text-slate-400" />
                                    )}
                                    <span className="text-sm font-medium text-slate-700">
                                        {permission === 'granted' ? 'Notificaciones push' : 'Activar notificaciones'}
                                    </span>
                                </div>
                                <button
                                    onClick={handleNotificationToggle}
                                    className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
                                        isPushEnabled && permission === 'granted'
                                            ? 'bg-emerald-500'
                                            : 'bg-slate-300'
                                    }`}
                                >
                                    <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                                        isPushEnabled && permission === 'granted'
                                            ? 'left-[calc(100%-1.625rem)]'
                                            : 'left-0.5'
                                    }`} />
                                </button>
                            </div>

                            {/* Test Notification Button */}
                            {permission === 'granted' && isPushEnabled && (
                                <button
                                    onClick={() => sendTestNotification()}
                                    className="mt-3 w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 py-2.5 rounded-xl text-xs font-bold border border-emerald-100 hover:bg-emerald-100 active:scale-[0.98] transition-all"
                                >
                                    <Send size={14} />
                                    Enviar notificación de prueba
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        if (item.path) {
                            return (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    className={`w-full flex items-center p-4 hover:bg-slate-50 transition-colors cursor-pointer ${index !== menuItems.length - 1 ? 'border-b border-slate-50' : ''}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 mr-4">
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="font-semibold text-slate-900 text-sm">{item.label}</h3>
                                        <p className="text-xs text-slate-500">{item.desc}</p>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-300" />
                                </Link>
                            );
                        }
                        
                        return (
                            <div
                                key={item.label}
                                className={`w-full flex items-center p-4 hover:bg-slate-50 transition-colors cursor-pointer ${index !== menuItems.length - 1 ? 'border-b border-slate-50' : ''}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 mr-4">
                                    <Icon size={20} />
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="font-semibold text-slate-900 text-sm">{item.label}</h3>
                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                </div>
                                <ChevronRight size={18} className="text-slate-300" />
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={handleSignOut}
                    className="w-full mt-6 flex items-center justify-center gap-2 text-red-500 font-medium py-3 hover:bg-red-50 rounded-xl transition-colors"
                >
                    <LogOut size={18} />
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
}
