import { Search, MapPin, Loader2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProfessionals } from '../hooks/useProfessionals';
import { ProfessionalCard } from '../components/ProfessionalCard';
import clsx from 'clsx';
import { useGeoref } from '../hooks/useGeoref';
import { MAIN_CATEGORIES } from './HomePage';

export function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Initial Params
    const categoryParam = searchParams.get('category');
    const qParam = searchParams.get('q') || '';
    const locParam = searchParams.get('loc') || '';

    const getInitialCategories = () => {
        if (!categoryParam) return ['servicio', 'tecnico', 'profesional', 'oficio'];
        if (categoryParam.includes(',')) {
            // handle multiple URL encoded
            return categoryParam.split(',').filter(c => ['servicio', 'tecnico', 'profesional', 'oficio'].includes(c));
        }
        return ['servicio', 'tecnico', 'profesional', 'oficio'].includes(categoryParam) 
            ? [categoryParam] 
            : ['servicio', 'tecnico', 'profesional', 'oficio'];
    };

    const [searchTerm, setSearchTerm] = useState(qParam);
    const [locationTerm, setLocationTerm] = useState(locParam);
    const [activeCategories, setActiveCategories] = useState<string[]>(getInitialCategories());

    const { professionals: filteredPros, isLoading } = useProfessionals(
        activeCategories,
        searchTerm || undefined
    );

    const { localidades, isLoading: isLocLoading } = useGeoref(locationTerm);
    const [showLocSuggestions, setShowLocSuggestions] = useState(false);

    // Update URL params when user clears inputs so it doesn't get stuck
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (searchTerm) params.set('q', searchTerm);
        else params.delete('q');
        
        if (locationTerm) params.set('loc', locationTerm);
        else params.delete('loc');
        if (activeCategories.length > 0 && activeCategories.length < 4) {
            params.set('category', activeCategories.join(','));
        } else {
            params.delete('category');
        }
        
        setSearchParams(params, { replace: true });
    }, [searchTerm, locationTerm, activeCategories, setSearchParams, searchParams]);

    // Backend handles filtering now via useProfessionals()! 
    // We already get exactly what we asked for in `filteredPros`.

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col pb-24">
            {/* Header & Search */}
            <div className="bg-slate-50 p-4 sticky top-0 z-10 border-b border-slate-100 shadow-sm">
                <h1 className="text-xl font-bold text-slate-900 mb-4">Explorar</h1>

                <div className="space-y-3">
                    {/* Location Input */}
                    <div className="relative z-20">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <MapPin className="text-emerald-500" size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Ej: Bahía Blanca, Neuquén, CABA..."
                            value={locationTerm}
                            onChange={(e) => {
                                setLocationTerm(e.target.value);
                                setShowLocSuggestions(true);
                            }}
                            onFocus={() => setShowLocSuggestions(true)}
                            onBlur={() => {
                                setTimeout(() => setShowLocSuggestions(false), 200);
                            }}
                            className="w-full bg-white pl-10 pr-10 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-slate-800 placeholder:text-slate-400 text-sm font-medium transition-all"
                        />
                        {locationTerm && (
                            <button 
                                onClick={() => { setLocationTerm(''); setShowLocSuggestions(false); }}
                                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                            >
                                <X size={16} />
                            </button>
                        )}

                        {/* Suggestions Dropdown */}
                        {showLocSuggestions && (locationTerm.length >= 3) && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                                {isLocLoading ? (
                                    <div className="flex items-center justify-center p-4">
                                        <Loader2 size={16} className="text-emerald-500 animate-spin mr-2" />
                                        <span className="text-sm text-slate-500">Buscando...</span>
                                    </div>
                                ) : localidades.length > 0 ? (
                                    <ul>
                                        {localidades.map((loc) => (
                                            <li key={loc.id}>
                                                <button
                                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex flex-col border-b border-slate-50 last:border-0 transition-colors"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setLocationTerm(`${loc.nombre}, ${loc.provincia.nombre}`);
                                                        setShowLocSuggestions(false);
                                                    }}
                                                >
                                                    <span className="font-medium text-slate-800 text-sm">{loc.nombre}</span>
                                                    <span className="text-xs text-slate-500">{loc.provincia.nombre}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-4 text-center text-sm text-slate-500">
                                        No se encontraron localidades.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                
                    {/* Text Search Input */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="text-slate-400" size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Ej: Gasista matriculado, Profesor de inglés..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white pl-10 pr-10 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-slate-800 placeholder:text-slate-400 text-sm font-medium transition-all"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Categories Flowing Row like in Home */}
                <div className="flex justify-between w-full mt-4 -mx-4 px-6 pb-2">
                    {MAIN_CATEGORIES.map((cat) => {
                        const isActive = activeCategories.includes(cat.id);
                        return (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategories(prev => 
                                        isActive 
                                            ? prev.filter(c => c !== cat.id)
                                            : [...prev, cat.id]
                                    );
                                }}
                                className={clsx(
                                    "flex flex-col items-center gap-2 group outline-none transition-all",
                                    isActive ? "scale-105" : "opacity-60 hover:opacity-100 grayscale-[50%]"
                                )}
                            >
                                <div className={clsx(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all",
                                    isActive ? `${cat.color} shadow-lg shadow-emerald-900/20 ring-4 ring-emerald-50` : "bg-slate-200 text-slate-400"
                                )}>
                                    <cat.icon size={isActive ? 26 : 22} strokeWidth={2} />
                                </div>
                                <span className={clsx(
                                    "text-[10px] uppercase tracking-wide text-center transition-colors",
                                    isActive ? "font-black text-slate-800" : "font-bold text-slate-400"
                                )}>
                                    {cat.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Results List */}
            {isLoading ? (
                <div className="flex flex-col items-center py-12 gap-3">
                    <Loader2 size={28} className="text-emerald-500 animate-spin" />
                    <p className="text-slate-400 text-sm">Cargando anuncios...</p>
                </div>
            ) : (
                <div className="px-4 space-y-4 pt-4">
                    {filteredPros.length > 0 ? (
                        <>
                            {filteredPros.map(pro => (
                                <ProfessionalCard key={pro.id} professional={pro} />
                            ))}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-slate-500 font-medium mb-2">No encontramos profesionales con esa búsqueda.</p>
                            <button 
                                onClick={() => { setSearchTerm(''); setLocationTerm(''); }} 
                                className="text-emerald-500 font-bold text-sm"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
