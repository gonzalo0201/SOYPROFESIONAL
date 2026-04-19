import { Search, MapPin, Briefcase, Wrench, GraduationCap, HardHat, Star, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { useProfessionals } from '../hooks/useProfessionals';
import type { ProfessionalDisplay } from '../services/professionals';
import clsx from 'clsx';

export const MAIN_CATEGORIES = [
    { id: 'todos', label: 'Todos', icon: Star, color: 'bg-slate-800' },
    { id: 'servicio', label: 'Servicios', icon: Briefcase, color: 'bg-emerald-500' },
    { id: 'tecnico', label: 'Técnicos', icon: Wrench, color: 'bg-teal-600' },
    { id: 'profesional', label: 'Profesionales', icon: GraduationCap, color: 'bg-cyan-600' },
    { id: 'oficio', label: 'Oficios', icon: HardHat, color: 'bg-emerald-700' },
];

// Rich mock data to ensure the homepage looks completely full of options
const MOCK_EXAMPLES: ProfessionalDisplay[] = [
    // Servicios
    { id: 'm1', name: 'Laura Martínez', trade: 'Niñera', rating: 4.9, reviews: 12, lat: 0, lng: 0, image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop', isVerified: true, isEarlyAdopter: false, isBoosted: false, status: 'Disponible', description: 'Cuidado de niños con referencias', skills: ['Niñera', 'Cuidado infantil'] },
    { id: 'm2', name: 'Transportes Gómez', trade: 'Flete', rating: 4.8, reviews: 34, lat: 0, lng: 0, image: 'https://images.unsplash.com/photo-1506869440621-3eef57c0a4e7?w=150&h=150&fit=crop', isVerified: true, isEarlyAdopter: true, isBoosted: true, status: 'Disponible', description: 'Mudanzas y fletes a todo el país', skills: ['Flete', 'Mudanza', 'Logística'] },
    { id: 'm3', name: 'Limpieza Total', trade: 'Limpieza', rating: 4.7, reviews: 56, lat: 0, lng: 0, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150&h=150&fit=crop', isVerified: false, isEarlyAdopter: false, isBoosted: false, status: 'Disponible', description: 'Limpieza profunda de hogares y oficinas', skills: ['Limpieza general', 'Terminación de obra'] },
    
    // Técnicos
    { id: 'm4', name: 'TechFix Arreglos', trade: 'Técnico PC', rating: 5.0, reviews: 89, lat: 0, lng: 0, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=150&h=150&fit=crop', isVerified: true, isEarlyAdopter: false, isBoosted: true, status: 'Disponible', description: 'Arreglo de notebooks y PC de escritorio', skills: ['PC', 'Hardware', 'Redes'] },
    { id: 'm5', name: 'Diego Climatización', trade: 'Aire Acondicionado', rating: 4.6, reviews: 23, lat: 0, lng: 0, image: 'https://images.unsplash.com/photo-1534398079543-7ae6d016b8be?w=150&h=150&fit=crop', isVerified: true, isEarlyAdopter: false, isBoosted: false, status: 'Ocupado', description: 'Instalación y service de aires', skills: ['Instalación', 'Aire Acondicionado'] },
    { id: 'm6', name: 'ReparaCell', trade: 'Técnico Celulares', rating: 4.5, reviews: 112, lat: 0, lng: 0, image: 'https://images.unsplash.com/photo-1581293370966-24ba0da9d8c4?w=150&h=150&fit=crop', isVerified: false, isEarlyAdopter: true, isBoosted: false, status: 'Disponible', description: 'Cambio de módulos en el acto', skills: ['Celulares', 'Pantallas', 'Baterías'] },

    // Profesionales
    { id: 'm7', name: 'Estudio Jurídico López', trade: 'Abogado', rating: 4.9, reviews: 45, lat: 0, lng: 0, image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop', isVerified: true, isEarlyAdopter: true, isBoosted: true, status: 'Disponible', description: 'Derecho laboral y familia', skills: ['Abogado', 'Laboral', 'Familia'] },
    { id: 'm8', name: 'Arq. Mariana Silva', trade: 'Arquitecta', rating: 5.0, reviews: 18, lat: 0, lng: 0, image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop', isVerified: true, isEarlyAdopter: false, isBoosted: false, status: 'Disponible', description: 'Diseño de planos y dirección de obra', skills: ['Arquitectura', 'Planos', 'Diseño'] },
    { id: 'm9', name: 'Contador Pérez', trade: 'Contador', rating: 4.8, reviews: 67, lat: 0, lng: 0, image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=150&h=150&fit=crop', isVerified: false, isEarlyAdopter: false, isBoosted: false, status: 'Disponible', description: 'Monotributo, ganancias y liquidaciones', skills: ['Contador', 'Impuestos', 'AFIP'] },

    // Oficios
    { id: 'm10', name: 'Carlos Gasista', trade: 'Gasista Matriculado', rating: 4.9, reviews: 156, lat: 0, lng: 0, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&h=150&fit=crop', isVerified: true, isEarlyAdopter: true, isBoosted: true, status: 'Disponible', description: 'Planos, pruebas de hermeticidad', skills: ['Gasista', 'Matriculado', 'Estufas'] },
    { id: 'm11', name: 'Maderas y Muebles', trade: 'Carpintero', rating: 4.7, reviews: 42, lat: 0, lng: 0, image: 'https://images.unsplash.com/photo-1610555356070-d1fb34aa2353?w=150&h=150&fit=crop', isVerified: false, isEarlyAdopter: false, isBoosted: false, status: 'Disponible', description: 'Muebles a medida y refacciones', skills: ['Carpintería', 'Muebles a medida', 'Madera'] },
    { id: 'm12', name: 'Obras Rápidas s.a.', trade: 'Albañil', rating: 4.4, reviews: 88, lat: 0, lng: 0, image: 'https://images.unsplash.com/photo-1541888086225-ee5315a639bf?w=150&h=150&fit=crop', isVerified: true, isEarlyAdopter: false, isBoosted: false, status: 'Ocupado', description: 'Lozas, revoques, colocación de cerámicos', skills: ['Albañilería', 'Pintura', 'Cerámicos'] },
];

export function HomePage() {
    const navigate = useNavigate();
    
    // Form Inputs
    const [locationInput, setLocationInput] = useState('');
    const [searchInput, setSearchInput] = useState('');
    
    // Active category filter on the Home page itself
    const [activeCategory, setActiveCategory] = useState<string>('todos');

    const { professionals } = useProfessionals(); 
    
    // Merge real database professionals with the hardcoded mock examples so the screen is always full
    const allPros = useMemo(() => {
        // Create a Set of existing IDs from DB to avoid duplicates if mocks share IDs
        const dbIds = new Set(professionals.map(p => p.id));
        const nonDuplicateMocks = MOCK_EXAMPLES.filter(m => !dbIds.has(m.id));
        return [...professionals, ...nonDuplicateMocks];
    }, [professionals]);

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

    // Filter the displayed professionals instantly based on local category click
    const displayedPros = useMemo(() => {
        if (activeCategory === 'todos') {
            // Unordered list of everything, but boosted at top like the original app did
            return allPros.sort((a, b) => (b.isBoosted ? 1 : 0) - (a.isBoosted ? 1 : 0));
        }

        return allPros.filter(pro => {
            const t = pro.trade.toLowerCase();
            if (activeCategory === 'servicio') return ['niñera', 'flete', 'limpieza', 'jardinero'].some(k => t.includes(k));
            if (activeCategory === 'tecnico') return ['pc', 'aire', 'celular', 'electrodomésticos', 'técnico'].some(k => t.includes(k));
            if (activeCategory === 'profesional') return ['abogado', 'arquitect', 'contador', 'médico'].some(k => t.includes(k));
            if (activeCategory === 'oficio') return ['gasista', 'carpintero', 'albañil', 'electricista', 'plomero'].some(k => t.includes(k));
            return true;
        });
    }, [allPros, activeCategory]);

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
                                onClick={() => setActiveCategory(cat.id)}
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
