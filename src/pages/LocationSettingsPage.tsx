import { ArrowLeft, MapPin, Navigation, Building2, CheckCircle2, Loader2, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation, type LocationMode } from '../contexts/LocationContext';
import { forwardGeocode, searchAddresses } from '../services/geocoding';
import clsx from 'clsx';

export function LocationSettingsPage() {
    const navigate = useNavigate();
    const {
        locationMode,
        setLocationMode,
        cityName,
        position,
        rawPosition,
        isLocating,
        error: locationError,
        permissionGranted,
        setFixedLocation,
        syncProfessionalLocation,
        requestLocation,
    } = useLocation();

    const [selectedMode, setSelectedMode] = useState<LocationMode>(locationMode);
    const [fixedAddress, setFixedAddress] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState<{ lat: number; lng: number; displayName: string }[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // Debounced address search
    useEffect(() => {
        if (fixedAddress.length < 3 || selectedMode !== 'fixed') {
            setAddressSuggestions([]);
            return;
        }

        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(async () => {
            setIsSearching(true);
            const results = await searchAddresses(fixedAddress);
            setAddressSuggestions(results);
            setIsSearching(false);
        }, 500);

        return () => clearTimeout(searchTimeout.current);
    }, [fixedAddress, selectedMode]);

    const handleSelectAddress = (suggestion: { lat: number; lng: number; displayName: string }) => {
        setFixedAddress(suggestion.displayName.split(',').slice(0, 2).join(','));
        setAddressSuggestions([]);
        setFixedLocation(suggestion.lat, suggestion.lng);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveError(null);

        try {
            // If switching to fixed and have an address to geocode
            if (selectedMode === 'fixed' && fixedAddress.trim()) {
                const result = await forwardGeocode(fixedAddress);
                if (result) {
                    setFixedLocation(result.lat, result.lng);
                    // Sync to Supabase
                    await syncProfessionalLocation(result.lat, result.lng);
                } else {
                    setSaveError('No se encontró la dirección. Intentá con otra.');
                    setIsSaving(false);
                    return;
                }
            } else if (selectedMode !== 'fixed' && permissionGranted) {
                // Sync current GPS position to Supabase
                await syncProfessionalLocation(position.lat, position.lng);
            }

            // Update the mode
            setLocationMode(selectedMode);

            // If switching to realtime/approximate and no GPS yet, request it
            if (selectedMode !== 'fixed' && !permissionGranted) {
                requestLocation();
            }

            setSaveSuccess(true);
            setTimeout(() => {
                navigate(-1);
            }, 800);
        } catch (err) {
            console.error('Error saving location:', err);
            setSaveError('Error al guardar la configuración');
        } finally {
            setIsSaving(false);
        }
    };

    const options = [
        {
            id: 'realtime' as LocationMode,
            title: 'Tiempo Real',
            desc: 'Ideal para viajes o servicios a domicilio. El cliente ve tu ubicación exacta mientras te desplazas.',
            icon: Navigation,
            color: 'bg-blue-500',
            detail: permissionGranted
                ? `📍 Posición actual: ${rawPosition.lat.toFixed(4)}, ${rawPosition.lng.toFixed(4)}`
                : '⚠️ Se solicitará permiso de ubicación',
        },
        {
            id: 'approximate' as LocationMode,
            title: 'Aproximada (Radio 500m)',
            desc: 'Protege tu privacidad. Se muestra un área general donde te encuentras, no el punto exacto.',
            icon: MapPin,
            color: 'bg-emerald-500',
            detail: permissionGranted
                ? `📍 Zona: ${cityName}`
                : '⚠️ Se solicitará permiso de ubicación',
        },
        {
            id: 'fixed' as LocationMode,
            title: 'Ubicación Fija / Oficina',
            desc: 'Tu dirección comercial permanente (ej. Estudio, Taller). Puedes editarla si te mudas.',
            icon: Building2,
            color: 'bg-slate-700',
            detail: '📌 Configurá tu dirección abajo',
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-slate-100 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-900">Configuración de Ubicación</h1>
            </div>

            <div className="p-6 flex-1">
                {/* Current Status */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className={clsx(
                            "w-10 h-10 rounded-full flex items-center justify-center text-white",
                            permissionGranted ? "bg-emerald-500" : "bg-amber-500"
                        )}>
                            {isLocating ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : permissionGranted ? (
                                <Navigation size={20} />
                            ) : (
                                <MapPin size={20} />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm text-slate-900">
                                {isLocating ? 'Detectando ubicación...' :
                                    permissionGranted ? `📍 ${cityName}` :
                                        locationError || 'Sin permisos de ubicación'}
                            </p>
                            <p className="text-xs text-slate-400">
                                Modo actual: {locationMode === 'realtime' ? 'Tiempo Real' :
                                    locationMode === 'approximate' ? 'Aproximada' : 'Fija'}
                            </p>
                        </div>
                        {!permissionGranted && !isLocating && (
                            <button
                                onClick={requestLocation}
                                className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full"
                            >
                                Activar GPS
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-slate-500 text-sm mb-4">
                    Elige cómo quieres que los usuarios te vean en el mapa. Puedes cambiar esto en cualquier momento.
                </p>

                <div className="space-y-4">
                    {options.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selectedMode === option.id;
                        const isCurrent = locationMode === option.id;

                        return (
                            <button
                                key={option.id}
                                onClick={() => setSelectedMode(option.id)}
                                className={clsx(
                                    "w-full text-left p-4 rounded-2xl border-2 transition-all relative overflow-hidden",
                                    isSelected
                                        ? "border-emerald-500 bg-white shadow-md"
                                        : "border-transparent bg-white shadow-sm hover:bg-slate-50"
                                )}
                            >
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className={clsx(
                                        "w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0",
                                        option.color
                                    )}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className={clsx("font-bold text-base mb-1", isSelected ? "text-emerald-500" : "text-slate-900")}>
                                                {option.title}
                                            </h3>
                                            {isCurrent && (
                                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                                                    Actual
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                            {option.desc}
                                        </p>
                                        {isSelected && (
                                            <p className="text-xs text-slate-400 mt-2 font-medium">
                                                {option.detail}
                                            </p>
                                        )}

                                        {/* Fixed address input */}
                                        {option.id === 'fixed' && isSelected && (
                                            <div className="mt-3 space-y-2">
                                                <div className="relative">
                                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        value={fixedAddress}
                                                        onChange={(e) => setFixedAddress(e.target.value)}
                                                        placeholder="Ingresa tu dirección (calle y altura)"
                                                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                                    />
                                                    {isSearching && (
                                                        <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
                                                    )}
                                                </div>

                                                {/* Address suggestions */}
                                                {addressSuggestions.length > 0 && (
                                                    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                                                        {addressSuggestions.map((suggestion, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSelectAddress(suggestion);
                                                                }}
                                                                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 text-xs text-slate-700 border-b border-slate-50 last:border-none flex items-start gap-2 transition-colors"
                                                            >
                                                                <MapPin size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                                                                <span className="line-clamp-2">{suggestion.displayName}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {isSelected && (
                                        <div className="absolute top-4 right-4 text-emerald-500">
                                            <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Error */}
                {saveError && (
                    <div className="mt-4 bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-200 text-sm font-medium">
                        {saveError}
                    </div>
                )}
            </div>

            <div className="p-6 bg-white border-t border-slate-100 sticky bottom-0">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={clsx(
                        "w-full font-bold py-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                        saveSuccess
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 disabled:opacity-50"
                    )}
                >
                    {isSaving ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : saveSuccess ? (
                        <CheckCircle2 size={18} />
                    ) : null}
                    {saveSuccess ? '¡Guardado!' : 'Guardar Cambios'}
                </button>
            </div>
        </div>
    );
}
