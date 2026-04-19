import { Search, MapPin, Briefcase, Wrench, GraduationCap, HardHat, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { useProfessionals } from '../hooks/useProfessionals';

export const MAIN_CATEGORIES = [
    { id: 'servicio', label: 'Servicios', icon: Briefcase, color: 'bg-emerald-500' },
    { id: 'tecnico', label: 'Técnicos', icon: Wrench, color: 'bg-teal-600' },
    { id: 'profesional', label: 'Profesionales', icon: GraduationCap, color: 'bg-cyan-600' },
    { id: 'oficio', label: 'Oficios', icon: HardHat, color: 'bg-emerald-700' },
];

export function HomePage() {
    const navigate = useNavigate();
    const { professionals } = useProfessionals(); 
    
    const [locationInput, setLocationInput] = useState('');
    const [searchInput, setSearchInput] = useState('');
    
    // Solo mostrar los destacados en el inicio
    const boostedPros = professionals.filter(pro => pro.isBoosted).slice(0, 4);

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
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-white text-lg">
                            S
                        </div>
                        <h1 className="text-xl font-black text-white">
                            Soy<span className="text-emerald-400">Profesional</span>
                        </h1>
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
                            Buscar profesional
                        </button>
                    </form>
                </div>
            </div>

            <div className="px-4 -mt-6 relative z-20">
                {/* Categories */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-8 mt-4">
                    <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Explorar categorías</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {MAIN_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => navigate(`/search?category=${cat.id}`)}
                                className="flex flex-col items-center gap-2 group outline-none"
                            >
                                <div className={`${cat.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-900/10 group-active:scale-95 transition-all`}>
                                    <cat.icon size={24} strokeWidth={2} />
                                </div>
                                <span className="font-bold text-slate-600 text-[10px] uppercase tracking-wide text-center">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Destacados */}
                {boostedPros.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex items-center gap-2">
                                <div className="bg-emerald-100 p-1.5 rounded-lg">
                                    <Flame size={16} className="text-emerald-600 fill-emerald-600" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">Destacados</h2>
                            </div>
                            <button 
                                onClick={() => navigate('/search')} 
                                className="text-emerald-600 font-bold text-xs uppercase tracking-wide hover:text-emerald-700 transition-colors bg-emerald-50 px-3 py-1.5 rounded-full"
                            >
                                Ver todos
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {boostedPros.map((pro) => (
                                <ProfessionalCard key={pro.id} professional={pro} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
