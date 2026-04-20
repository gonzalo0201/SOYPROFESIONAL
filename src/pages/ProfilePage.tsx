import { Link, useNavigate } from 'react-router-dom';
import { User, ChevronRight, LogOut, Loader2, Bell, BellOff, HelpCircle, FileText, Info, Zap } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { setProfessionalBoosted } from '../services/professionals';

export function ProfilePage() {
    const { permission, isSupported, isPushEnabled, togglePush, requestPermission } = useNotifications();
    const { user, profile, isLoading, signOut } = useAuth();
    const navigate = useNavigate();
    const [isBoosting, setIsBoosting] = useState(false);
    const [boostSuccess, setBoostSuccess] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            navigate('/login');
        }
    }, [isLoading, user, navigate]);

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

    const handleBoost = async () => {
        if (!user) return;
        setIsBoosting(true);
        const { error } = await setProfessionalBoosted(profile?.id || user.id);
        setIsBoosting(false);
        if (!error) {
            setBoostSuccess(true);
            setTimeout(() => setBoostSuccess(false), 3000);
        } else {
            alert('Error al impulsar perfil');
        }
    };

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

    const userName = profile?.name || user?.user_metadata?.name || 'Usuario';
    const userEmail = profile?.email || user?.email || '';
    const userRole = profile?.role === 'professional' ? 'Profesional' : 'Cliente';
    const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=10b981&color=fff&bold=true`;

    return (
        <div className="bg-slate-50 min-h-full pb-24">
            {/* Header */}
            <div className="bg-white p-4 border-b border-slate-100">
                <h1 className="text-xl font-bold text-slate-900">Mi Perfil</h1>
            </div>

            <div className="p-4 space-y-4">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-200 shrink-0">
                            <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-slate-900 truncate">{userName}</h2>
                            <p className="text-emerald-600 text-sm font-medium">{userRole}</p>
                            {userEmail && (
                                <p className="text-slate-400 text-xs mt-0.5 truncate">{userEmail}</p>
                            )}
                        </div>
                    </div>

                    <Link
                        to="/edit-profile"
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold transition-colors active:scale-[0.98]"
                    >
                        <User size={16} />
                        Editar perfil
                    </Link>

                    {profile?.role === 'professional' && (
                        <button
                            onClick={handleBoost}
                            disabled={isBoosting || boostSuccess}
                            className="mt-2 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-emerald-400 py-2.5 rounded-xl text-sm font-bold transition-colors active:scale-[0.98]"
                        >
                            {isBoosting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                            {boostSuccess ? '¡Perfil Impulsado!' : 'Impulsar Perfil (Gratis x100)'}
                        </button>
                    )}
                </div>

                {/* Notifications Toggle */}
                {isSupported && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                                    {isPushEnabled && permission === 'granted' ? (
                                        <Bell size={18} className="text-emerald-600" />
                                    ) : (
                                        <BellOff size={18} className="text-slate-400" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 text-sm">Notificaciones</h3>
                                    <p className="text-xs text-slate-500">
                                        {isPushEnabled && permission === 'granted' ? 'Activadas' : 'Desactivadas'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleNotificationToggle}
                                className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
                                    isPushEnabled && permission === 'granted' ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                            >
                                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                                    isPushEnabled && permission === 'granted'
                                        ? 'left-[calc(100%-1.625rem)]'
                                        : 'left-0.5'
                                }`} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Menu Items */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="w-full flex items-center p-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 mr-4">
                            <HelpCircle size={20} />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-slate-900 text-sm">Ayuda</h3>
                            <p className="text-xs text-slate-500">Preguntas frecuentes</p>
                        </div>
                        <ChevronRight size={18} className="text-slate-300" />
                    </div>

                    <div className="w-full flex items-center p-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 mr-4">
                            <FileText size={20} />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-slate-900 text-sm">Términos y condiciones</h3>
                            <p className="text-xs text-slate-500">Políticas de uso</p>
                        </div>
                        <ChevronRight size={18} className="text-slate-300" />
                    </div>

                    <div className="w-full flex items-center p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 mr-4">
                            <Info size={20} />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-slate-900 text-sm">Acerca de</h3>
                            <p className="text-xs text-slate-500">SoyProfesional v1.0</p>
                        </div>
                        <ChevronRight size={18} className="text-slate-300" />
                    </div>
                </div>

                {/* Sign Out */}
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 text-red-500 font-medium py-3 hover:bg-red-50 rounded-xl transition-colors"
                >
                    <LogOut size={18} />
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
}
