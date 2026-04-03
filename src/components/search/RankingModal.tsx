import { useState } from 'react';
import { X, Trophy, TrendingUp, TrendingDown, Minus, MapPin } from 'lucide-react';
import { MOCK_RANKINGS, TIME_RANGES } from '../../data/mockStats';
import clsx from 'clsx';
import { CitySearch } from '../map/CitySearch';

interface RankingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RankingModal({ isOpen, onClose }: RankingModalProps) {
    const [selectedCity] = useState<string>('Bahía Blanca');
    const [selectedTime, setSelectedTime] = useState<string>('month');
    const [view, setView] = useState<'search' | 'results'>('results'); // Start with results for 'Bahía Blanca' demo

    // Mock getting data based on city (fallback to Bahia Blanca if not found for demo)
    const rankings = MOCK_RANKINGS[selectedCity.split(',')[0]] || MOCK_RANKINGS['Bahía Blanca'];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="bg-slate-50 w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 pointer-events-auto flex flex-col animate-in slide-in-from-bottom-10 duration-300">

                {/* Header */}
                <div className="p-6 pb-2">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-100 p-2.5 rounded-xl">
                                <Trophy className="text-amber-600 w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Ranking de Demanda</h2>
                                <p className="text-slate-500 text-sm">Lo más buscado en tu zona.</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col gap-3">
                        {/* City Selector */}
                        <div className="relative">
                            {view === 'search' ? (
                                <div className="animate-in fade-in zoom-in-95">
                                    <CitySearch onSelectLocation={(_lat, _lng) => {
                                        // Reverse geocoding mock or just finding name from CITIES
                                        // For this demo, let's just toggle back to results
                                        // In real app, we'd map coords to name or pass name from CitySearch
                                        setView('results');
                                    }} />
                                    {/* Helper to show we are searching */}
                                    <p className="text-xs text-slate-400 mt-2 ml-2">Selecciona una ciudad para ver su ranking</p>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setView('search')}
                                    className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm hover:border-emerald-300 transition-colors group"
                                >
                                    <div className="flex items-center gap-3 text-slate-700">
                                        <MapPin size={18} className="text-emerald-500" />
                                        <span className="font-semibold">{selectedCity}</span>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md group-hover:bg-emerald-100 transition-colors">Cambiar</span>
                                </button>
                            )}
                        </div>

                        {/* Time Selector */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {TIME_RANGES.map((range) => (
                                <button
                                    key={range.id}
                                    onClick={() => setSelectedTime(range.id)}
                                    className={clsx(
                                        "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all",
                                        selectedTime === range.id
                                            ? "bg-slate-900 text-white border-slate-900 shadow-md"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                                    )}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
                    {rankings.map((item, index) => (
                        <div key={item.trade} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                                index === 0 ? "bg-amber-100 text-amber-600 border-2 border-amber-200" :
                                    index === 1 ? "bg-slate-200 text-slate-600 border-2 border-slate-300" :
                                        index === 2 ? "bg-orange-100 text-orange-600 border-2 border-orange-200" :
                                            "bg-slate-50 text-slate-400 border border-slate-100 text-sm"
                            )}>
                                {index + 1}
                            </div>

                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900">{item.trade}</h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>{item.count.toLocaleString()} búsquedas</span>
                                </div>
                            </div>

                            <div className={clsx(
                                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                                item.trend === 'up' ? "bg-emerald-50 text-emerald-600" :
                                    item.trend === 'down' ? "bg-rose-50 text-rose-600" :
                                        "bg-slate-100 text-slate-500"
                            )}>
                                {item.trend === 'up' && <TrendingUp size={12} />}
                                {item.trend === 'down' && <TrendingDown size={12} />}
                                {item.trend === 'stable' && <Minus size={12} />}
                                {item.change > 0 ? '+' : ''}{item.change}%
                            </div>
                        </div>
                    ))}

                    <div className="p-4 bg-slate-100 rounded-2xl text-center mt-4">
                        <p className="text-slate-500 text-xs text-balance">
                            💡 Estadísticas basadas en búsquedas reales de usuarios en {selectedCity} durante {TIME_RANGES.find(t => t.id === selectedTime)?.label.toLowerCase()}.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
