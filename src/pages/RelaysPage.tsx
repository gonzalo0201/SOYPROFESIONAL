import { ArrowLeft, UserPlus, Star, Shield } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export function RelaysPage() {
    const navigate = useNavigate();
    const [isEnabled, setIsEnabled] = useState(true);

    // Mock Colleagues ("Relevos")
    const colleagues = [
        {
            id: 1,
            name: 'Franco',
            role: 'Electricista',
            rating: 4.7,
            reviews: 41,
            image: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&h=150&fit=crop',
            isVerified: true
        },
        // Add more if needed implementation
    ];

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-slate-100 flex items-center gap-4 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-900">Mis Relevos</h1>
            </div>

            <div className="p-6 flex-1">

                {/* Toggle Section */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-8 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-900">Activar Relevos</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                            Permite recibir y derivar trabajos a tus colegas de confianza.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsEnabled(!isEnabled)}
                        className={clsx(
                            "w-12 h-7 rounded-full transition-colors relative",
                            isEnabled ? "bg-emerald-500" : "bg-slate-300"
                        )}
                    >
                        <div className={clsx(
                            "w-5 h-5 bg-white rounded-full absolute top-1 transition-transform shadow-sm",
                            isEnabled ? "left-6" : "left-1"
                        )} />
                    </button>
                </div>

                {isEnabled ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-slate-800 text-lg">Mis Colegas ({colleagues.length})</h2>
                            <button className="text-emerald-500 text-sm font-medium flex items-center gap-1 active:opacity-70">
                                <UserPlus size={16} /> Agregar
                            </button>
                        </div>

                        <div className="space-y-4">
                            {colleagues.map(colleague => (
                                <div key={colleague.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                                    <div className="relative">
                                        <img src={colleague.image} alt={colleague.name} className="w-14 h-14 rounded-full object-cover border border-slate-100" />
                                        {colleague.isVerified && (
                                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                                <Shield size={14} className="text-emerald-500 fill-current" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900">{colleague.name}</h3>
                                        <p className="text-xs text-slate-500 mb-1">{colleague.role}</p>
                                        <div className="flex items-center gap-1">
                                            <Star size={14} className="text-amber-400 fill-current" />
                                            <span className="text-sm font-bold text-slate-700">{colleague.rating}</span>
                                            <span className="text-xs text-slate-400">({colleague.reviews} reseñas)</span>
                                        </div>
                                    </div>

                                    <button className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-100 border border-slate-200">
                                        Gestionar
                                    </button>
                                </div>
                            ))}

                            {/* Placeholder for 'Add new' visual cue if list is small */}
                            <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-colors">
                                <UserPlus size={24} />
                                <span className="text-sm font-medium">Invitar a un nuevo colega</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 opacity-60">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                            <UserPlus size={32} />
                        </div>
                        <h3 className="font-semibold text-slate-800">Relevos desactivados</h3>
                        <p className="text-sm text-slate-500 mt-2 max-w-[250px] mx-auto">
                            Activa esta función para poder derivar trabajos cuando no estés disponible.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
