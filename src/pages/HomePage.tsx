import { Search, MapPin, Briefcase, Wrench, GraduationCap, HardHat, CheckCircle, Heart, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { useProfessionals } from '../hooks/useProfessionals';
import clsx from 'clsx';

export const MAIN_CATEGORIES = [
    { id: 'servicio', label: 'Servicios', icon: Briefcase, color: 'bg-emerald-500' },
    { id: 'tecnico', label: 'Técnicos', icon: Wrench, color: 'bg-teal-600' },
    { id: 'profesional', label: 'Profesionales', icon: GraduationCap, color: 'bg-cyan-600' },
    { id: 'oficio', label: 'Oficios', icon: HardHat, color: 'bg-emerald-700' },
];



export function HomePage() {
    const navigate = useNavigate();
    
    // Form Inputs
    const [locationInput, setLocationInput] = useState('');
    const [searchInput, setSearchInput] = useState('');
    
    // Active category filter on the Home page itself
    const [activeCategory, setActiveCategory] = useState<string>('todos');

    const { professionals } = useProfessionals(activeCategory === 'todos' ? undefined : activeCategory);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (locationInput) params.append('loc', locationInput);
        if (searchInput) params.append('q', searchInput);
        
        navigate({
            pathname: '/search',
            search: params.toString()
        });
    };

    // Filter logic removed because Supabase does it efficiently on the backend!
    const displayedPros = professionals;

    return (
        <div className="pb-24 bg-slate-50 min-h-screen">
            {/* Hero Section */}
            <div className="bg-slate-900 text-white pt-8 pb-12 px-4 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500 rounded-full blur-3xl"></div>
                    <div className="absolute top-20 -left-10 w-40 h-40 bg-teal-500 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-white text-lg">
                                S
                            </div>
                            <h1 className="text-xl font-black text-white">
                                Soy<span className="text-emerald-400">Profesional</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => navigate('/favorites')}
                                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors"
                            >
                                <Heart size={20} />
                            </button>
                            <button 
                                onClick={() => navigate('/notifications')}
                                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors"
                            >
                                <Bell size={20} />
                            </button>
                        </div>
                    </div>

                    <h2 className="text-3xl font-black mb-3 leading-tight">
                        Encontrá al <br/>
                        <span className="text-emerald-400">experto ideal</span>
                    </h2>
                    <p className="text-slate-400 text-sm mb-6 max-w-[280px]">
                        Conectamos a clientes con los mejores profesionales y oficios de la ciudad.
                    </p>

                    {/* True Search Form */}
                    <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl flex flex-col gap-2">
                        <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-3 rounded-xl border border-white/10">
                            <MapPin className="text-emerald-400 shrink-0" size={18} />
                            <input 
                                type="text"
                                placeholder="Ej: Bahía Blanca, Neuquén..."
                                value={locationInput}
                                onChange={(e) => setLocationInput(e.target.value)}
                                className="bg-transparent border-none outline-none text-white placeholder:text-slate-400 text-sm w-full"
                            />
                        </div>
                        <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-3 rounded-xl border border-white/10">
                            <Search className="text-emerald-400 shrink-0" size={18} />
                            <input 
                                type="text"
                                placeholder="Ej: Gasista, limpieza, abogado..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="bg-transparent border-none outline-none text-white placeholder:text-slate-400 text-sm w-full"
                            />
                        </div>
                        <button 
                            type="submit"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl uppercase tracking-wide text-sm transition-colors mt-1"
                        >
                            Buscar rápido
                        </button>
                    </form>
                </div>
            </div>

            <div className="px-4 -mt-6 relative z-20">
                {/* Categories Live Filter */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-8 mt-4 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-4 w-max px-2">
                        {MAIN_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(activeCategory === cat.id ? 'todos' : cat.id)}
                                className={clsx(
                                    "flex flex-col items-center gap-2 group outline-none min-w-[72px] transition-all",
                                    activeCategory === cat.id ? "scale-105" : "opacity-70 hover:opacity-100"
                                )}
                            >
                                <div className={clsx(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all",
                                    activeCategory === cat.id ? `${cat.color} shadow-lg shadow-emerald-900/20 ring-4 ring-emerald-50` : "bg-slate-200 text-slate-500"
                                )}>
                                    <cat.icon size={activeCategory === cat.id ? 26 : 22} strokeWidth={2} />
                                </div>
                                <span className={clsx(
                                    "text-[10px] uppercase tracking-wide text-center transition-colors",
                                    activeCategory === cat.id ? "font-black text-slate-800" : "font-bold text-slate-500"
                                )}>
                                    {cat.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Unified Anunciantes List */}
                <div className="mb-4 px-1">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <CheckCircle size={18} className="text-emerald-500" />
                        {activeCategory === 'todos' ? 'Todos los anunciantes' : `Resultados: ${MAIN_CATEGORIES.find(c => c.id === activeCategory)?.label}`}
                        <span className="text-xs font-normal text-slate-400 ml-auto">({displayedPros.length})</span>
                    </h2>
                </div>
                
                <div className="space-y-4">
                    {displayedPros.length > 0 ? (
                        displayedPros.map((pro) => (
                            <ProfessionalCard key={pro.id} professional={pro} />
                        ))
                    ) : (
                        <div className="text-center py-10 bg-white rounded-3xl border border-slate-100">
                            <p className="text-slate-500 text-sm font-medium">No hay anunciantes en esta categoría todavía.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
