import { ArrowLeft, MapPin, Navigation, Building2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

type LocationMode = 'realtime' | 'approximate' | 'fixed';

export function LocationSettingsPage() {
    const navigate = useNavigate();
    const [selectedMode, setSelectedMode] = useState<LocationMode>('fixed'); // Default

    const handleSave = () => {
        // Save logic here
        navigate('/profile');
    };

    const options = [
        {
            id: 'realtime',
            title: 'Tiempo Real',
            desc: 'Ideal para viajes o servicios a domicilio. El cliente ve tu ubicación exacta mientras te desplazas.',
            icon: Navigation,
            color: 'bg-blue-500',
        },
        {
            id: 'approximate',
            title: 'Aproximada (Radio 500m)',
            desc: 'Protege tu privacidad. Se muestra un área general donde te encuentras, no el punto exacto.',
            icon: MapPin,
            color: 'bg-emerald-500',
        },
        {
            id: 'fixed',
            title: 'Ubicación Fija / Oficina',
            desc: 'Tu dirección comercial permanente (ej. Estudio, Taller). Puedes editarla si te mudas.',
            icon: Building2,
            color: 'bg-slate-700',
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-slate-100 flex items-center gap-4 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-900">Configuración de Ubicación</h1>
            </div>

            <div className="p-6 flex-1">
                <p className="text-slate-500 text-sm mb-6">
                    Elige cómo quieres que los usuarios te vean en el mapa. Puedes cambiar esto en cualquier momento.
                </p>

                <div className="space-y-4">
                    {options.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selectedMode === option.id;

                        return (
                            <button
                                key={option.id}
                                onClick={() => setSelectedMode(option.id as LocationMode)}
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
                                        <h3 className={clsx("font-bold text-base mb-1", isSelected ? "text-emerald-500" : "text-slate-900")}>
                                            {option.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                            {option.desc}
                                        </p>

                                        {option.id === 'fixed' && isSelected && (
                                            <div className="mt-3">
                                                <input
                                                    type="text"
                                                    placeholder="Ingresa tu dirección (calle y altura)"
                                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                                                />
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
            </div>

            <div className="p-6 bg-white border-t border-slate-100 sticky bottom-0">
                <button
                    onClick={handleSave}
                    className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-transform"
                >
                    Guardar Cambios
                </button>
            </div>
        </div>
    );
}
