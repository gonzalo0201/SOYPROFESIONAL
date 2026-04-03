import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../data/mockCategories';
import {
    Wrench, ChevronRight, ChevronLeft, Camera, Image as ImageIcon,
    MapPin, Navigation, Building2, CheckCircle2, Sparkles, Rocket,
    PartyPopper, Star, Shield
} from 'lucide-react';
import clsx from 'clsx';

type LocationMode = 'realtime' | 'approximate' | 'fixed';

const TOTAL_STEPS = 5;

export function OnboardingPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState<'forward' | 'back'>('forward');
    const [isAnimating, setIsAnimating] = useState(false);

    // Step 2 state
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    // Step 3 state
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

    // Step 4 state
    const [locationMode, setLocationMode] = useState<LocationMode>('approximate');
    const [fixedAddress, setFixedAddress] = useState('');

    // Step 5 confetti
    const [showConfetti, setShowConfetti] = useState(false);

    // Check if onboarding already completed
    useEffect(() => {
        const completed = localStorage.getItem('onboarding_completed');
        if (completed === 'true') {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    // Show confetti on step 5
    useEffect(() => {
        if (step === 5) {
            setTimeout(() => setShowConfetti(true), 300);
        }
    }, [step]);

    const goNext = () => {
        if (isAnimating) return;
        setDirection('forward');
        setIsAnimating(true);
        setTimeout(() => {
            setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
            setIsAnimating(false);
        }, 250);
    };

    const goBack = () => {
        if (isAnimating || step === 1) return;
        setDirection('back');
        setIsAnimating(true);
        setTimeout(() => {
            setStep(prev => Math.max(prev - 1, 1));
            setIsAnimating(false);
        }, 250);
    };

    const handleComplete = () => {
        localStorage.setItem('onboarding_completed', 'true');
        navigate('/', { replace: true });
    };

    const toggleService = (serviceId: string) => {
        setSelectedServices(prev =>
            prev.includes(serviceId)
                ? prev.filter(s => s !== serviceId)
                : [...prev, serviceId]
        );
    };

    const simulatePhotoSelect = () => {
        const photos = [
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
        ];
        setProfilePhoto(photos[Math.floor(Math.random() * photos.length)]);
    };

    const selectedCat = CATEGORIES.find(c => c.id === selectedCategory);

    // Can advance?
    const canAdvance = (() => {
        switch (step) {
            case 1: return true;
            case 2: return selectedServices.length > 0;
            case 3: return true; // photo is optional
            case 4: return locationMode === 'fixed' ? fixedAddress.trim().length > 0 : true;
            default: return true;
        }
    })();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex flex-col relative overflow-hidden">
            {/* Decorative BG */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-40 -right-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
            </div>

            {/* Confetti overlay */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <div
                            key={i}
                            className="onb-confetti-piece"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 3}s`,
                                backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
                                width: `${6 + Math.random() * 8}px`,
                                height: `${6 + Math.random() * 8}px`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Progress Bar */}
            {step < 5 && (
                <div className="relative z-10 px-6 pt-6 pb-2">
                    <div className="flex items-center justify-between mb-2">
                        {step > 1 ? (
                            <button onClick={goBack} className="text-white/60 hover:text-white transition-colors p-1 -ml-1">
                                <ChevronLeft size={20} />
                            </button>
                        ) : <div className="w-7" />}
                        <span className="text-xs text-white/40 font-medium">{step} de {TOTAL_STEPS - 1}</span>
                        <div className="w-7" />
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${((step - 1) / (TOTAL_STEPS - 2)) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Step Content */}
            <div
                className={clsx(
                    "relative z-10 flex-1 flex flex-col px-6 py-4 transition-all duration-250",
                    isAnimating && direction === 'forward' && "opacity-0 translate-x-8",
                    isAnimating && direction === 'back' && "opacity-0 -translate-x-8",
                )}
            >
                {/* STEP 1 – BIENVENIDA */}
                {step === 1 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30 rotate-3 onb-bounce-in">
                            <Wrench size={36} className="text-white -rotate-3" />
                        </div>

                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                            SOY<span className="text-emerald-400">PROFESIONAL</span>
                        </h1>
                        <p className="text-slate-400 text-base mb-2 max-w-xs">
                            Mostrá lo que sabés hacer.
                        </p>
                        <p className="text-slate-500 text-sm mb-10 max-w-[280px] leading-relaxed">
                            Configurá tu perfil en 3 simples pasos y empezá a recibir clientes hoy mismo.
                        </p>

                        <div className="flex flex-col gap-3 w-full max-w-xs">
                            <button
                                onClick={goNext}
                                className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.97] transition-transform"
                            >
                                Empezar
                                <ChevronRight size={20} />
                            </button>
                            <button
                                onClick={handleComplete}
                                className="text-slate-500 text-sm font-medium hover:text-slate-300 transition-colors py-2"
                            >
                                Omitir por ahora
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2 – ¿QUÉ HACÉS? */}
                {step === 2 && (
                    <div className="flex-1 flex flex-col">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-white mb-1">¿Qué hacés?</h2>
                            <p className="text-slate-400 text-sm">Elegí tu rubro y los servicios que ofrecés.</p>
                        </div>

                        {/* Category Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-5">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setSelectedCategory(cat.id === selectedCategory ? null : cat.id);
                                        if (cat.id !== selectedCategory) setSelectedServices([]);
                                    }}
                                    className={clsx(
                                        "p-4 rounded-2xl border-2 transition-all text-left active:scale-[0.97]",
                                        selectedCategory === cat.id
                                            ? "bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/10"
                                            : "bg-white/5 border-white/10 hover:bg-white/10"
                                    )}
                                >
                                    <span className="text-2xl mb-2 block">{cat.icon}</span>
                                    <span className={clsx(
                                        "font-bold text-sm block",
                                        selectedCategory === cat.id ? "text-emerald-400" : "text-white"
                                    )}>
                                        {cat.name}
                                    </span>
                                    <span className="text-[11px] text-slate-500">{cat.services.length} servicios</span>
                                </button>
                            ))}
                        </div>

                        {/* Services pills */}
                        {selectedCat && (
                            <div className="flex-1 overflow-y-auto">
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3">
                                    Servicios de {selectedCat.name}
                                </p>
                                <div className="flex flex-wrap gap-2 pb-4">
                                    {selectedCat.services.map(service => (
                                        <button
                                            key={service.id}
                                            onClick={() => toggleService(service.id)}
                                            className={clsx(
                                                "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 border",
                                                selectedServices.includes(service.id)
                                                    ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20"
                                                    : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                                            )}
                                        >
                                            {service.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bottom button */}
                        <div className="pt-4 mt-auto">
                            <button
                                onClick={goNext}
                                disabled={!canAdvance}
                                className={clsx(
                                    "w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all",
                                    canAdvance
                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 active:scale-[0.97]"
                                        : "bg-white/10 text-white/30 cursor-not-allowed"
                                )}
                            >
                                Continuar
                                <ChevronRight size={20} />
                            </button>
                            {selectedServices.length > 0 && (
                                <p className="text-center text-xs text-emerald-400 mt-2 font-medium">
                                    {selectedServices.length} servicio{selectedServices.length > 1 ? 's' : ''} seleccionado{selectedServices.length > 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 3 – FOTO DE PERFIL */}
                {step === 3 && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold text-white mb-1">Tu foto de perfil</h2>
                            <p className="text-slate-400 text-sm max-w-xs">
                                Los clientes confían más en profesionales con foto. ¡Subí la tuya!
                            </p>
                        </div>

                        {/* Avatar */}
                        <div className="relative mb-8">
                            <div className={clsx(
                                "w-36 h-36 rounded-full border-4 overflow-hidden shadow-2xl transition-all",
                                profilePhoto ? "border-emerald-400" : "border-white/20"
                            )}>
                                {profilePhoto ? (
                                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                        <Camera size={48} className="text-white/30" />
                                    </div>
                                )}
                            </div>
                            {profilePhoto && (
                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-2 rounded-full shadow-lg border-2 border-slate-800">
                                    <CheckCircle2 size={20} className="text-white" />
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 w-full max-w-sm mb-6">
                            <button
                                onClick={simulatePhotoSelect}
                                className="flex-1 bg-white/10 backdrop-blur-sm text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm border border-white/10"
                            >
                                <Camera size={18} />
                                Cámara
                            </button>
                            <button
                                onClick={simulatePhotoSelect}
                                className="flex-1 bg-white/10 backdrop-blur-sm text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm border border-white/10"
                            >
                                <ImageIcon size={18} />
                                Galería
                            </button>
                        </div>

                        {/* Continue */}
                        <div className="w-full max-w-sm space-y-3 mt-auto pb-4">
                            <button
                                onClick={goNext}
                                className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.97] transition-transform"
                            >
                                {profilePhoto ? 'Continuar' : 'Omitir por ahora'}
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4 – TU ZONA */}
                {step === 4 && (
                    <div className="flex-1 flex flex-col">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-white mb-1">¿Dónde trabajás?</h2>
                            <p className="text-slate-400 text-sm">Elegí cómo aparecés en el mapa para tus clientes.</p>
                        </div>

                        <div className="space-y-3 flex-1">
                            {[
                                {
                                    id: 'realtime' as LocationMode,
                                    title: 'Tiempo Real',
                                    desc: 'El cliente ve tu ubicación mientras te desplazás.',
                                    icon: Navigation,
                                    gradient: 'from-blue-500 to-blue-600',
                                },
                                {
                                    id: 'approximate' as LocationMode,
                                    title: 'Aproximada',
                                    desc: 'Se muestra un área general, no tu punto exacto.',
                                    icon: MapPin,
                                    gradient: 'from-emerald-500 to-emerald-600',
                                },
                                {
                                    id: 'fixed' as LocationMode,
                                    title: 'Ubicación Fija',
                                    desc: 'Tu dirección comercial: taller, estudio, oficina.',
                                    icon: Building2,
                                    gradient: 'from-slate-500 to-slate-600',
                                },
                            ].map(option => {
                                const Icon = option.icon;
                                const isSelected = locationMode === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => setLocationMode(option.id)}
                                        className={clsx(
                                            "w-full text-left p-4 rounded-2xl border-2 transition-all active:scale-[0.98]",
                                            isSelected
                                                ? "bg-white/10 border-emerald-400 shadow-lg shadow-emerald-500/10"
                                                : "bg-white/5 border-white/10 hover:bg-white/10"
                                        )}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={clsx(
                                                "w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 bg-gradient-to-br shadow-lg",
                                                option.gradient
                                            )}>
                                                <Icon size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className={clsx(
                                                    "font-bold text-sm mb-0.5",
                                                    isSelected ? "text-emerald-400" : "text-white"
                                                )}>
                                                    {option.title}
                                                </h3>
                                                <p className="text-xs text-slate-400 leading-relaxed">
                                                    {option.desc}
                                                </p>

                                                {option.id === 'fixed' && isSelected && (
                                                    <input
                                                        type="text"
                                                        value={fixedAddress}
                                                        onChange={(e) => setFixedAddress(e.target.value)}
                                                        placeholder="Ej: Av. Colón 1234, Bahía Blanca"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full mt-3 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-400/50 transition-all"
                                                    />
                                                )}
                                            </div>
                                            {isSelected && (
                                                <div className="shrink-0 mt-1">
                                                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                                        <CheckCircle2 size={14} className="text-white" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Continue */}
                        <div className="pt-4 mt-auto">
                            <button
                                onClick={goNext}
                                disabled={!canAdvance}
                                className={clsx(
                                    "w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all",
                                    canAdvance
                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 active:scale-[0.97]"
                                        : "bg-white/10 text-white/30 cursor-not-allowed"
                                )}
                            >
                                Continuar
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 5 – ¡LISTO! */}
                {step === 5 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="onb-bounce-in">
                            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/40 mx-auto">
                                <PartyPopper size={44} className="text-white" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-black text-white mb-2">¡Todo listo!</h2>
                        <p className="text-slate-400 text-base mb-8 max-w-xs">
                            Tu perfil está configurado. Ya podés empezar a conectar con clientes.
                        </p>

                        {/* Summary */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5 w-full max-w-sm mb-8 space-y-4">
                            {selectedServices.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                                        <Wrench size={16} className="text-emerald-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs text-slate-500">Servicios</p>
                                        <p className="text-sm text-white font-semibold">
                                            {selectedServices.length} servicio{selectedServices.length > 1 ? 's' : ''} en {selectedCat?.name}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                                    <MapPin size={16} className="text-blue-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs text-slate-500">Ubicación</p>
                                    <p className="text-sm text-white font-semibold">
                                        {locationMode === 'realtime' ? 'Tiempo real' : locationMode === 'approximate' ? 'Aproximada' : fixedAddress || 'Fija'}
                                    </p>
                                </div>
                            </div>

                            {profilePhoto && (
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-purple-500/20 rounded-full flex items-center justify-center shrink-0">
                                        <Camera size={16} className="text-purple-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs text-slate-500">Foto</p>
                                        <p className="text-sm text-white font-semibold">✓ Subida</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tips */}
                        <div className="flex gap-2 mb-8 w-full max-w-sm">
                            <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/10">
                                <Star size={18} className="text-amber-400 mx-auto mb-1" />
                                <p className="text-[10px] text-slate-400 leading-tight">Completá tu portafolio para destacar</p>
                            </div>
                            <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/10">
                                <Shield size={18} className="text-emerald-400 mx-auto mb-1" />
                                <p className="text-[10px] text-slate-400 leading-tight">Verificá tu cuenta para generar confianza</p>
                            </div>
                            <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/10">
                                <Rocket size={18} className="text-blue-400 mx-auto mb-1" />
                                <p className="text-[10px] text-slate-400 leading-tight">Impulsá tu perfil para más visibilidad</p>
                            </div>
                        </div>

                        <button
                            onClick={handleComplete}
                            className="w-full max-w-sm bg-emerald-500 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.97] transition-transform"
                        >
                            <Sparkles size={20} />
                            Explorar SOYPROFESIONAL
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
