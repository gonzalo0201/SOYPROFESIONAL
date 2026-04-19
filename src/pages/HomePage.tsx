import { Search, MapPin, Briefcase, Wrench, GraduationCap, HardHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { useProfessionals } from '../hooks/useProfessionals';

export const MAIN_CATEGORIES = [
    { id: 'servicio', label: 'Servicio', icon: Briefcase, color: 'bg-amber-500' },
    { id: 'tecnico', label: 'Técnico', icon: Wrench, color: 'bg-emerald-500' },
    { id: 'profesional', label: 'Profesional', icon: GraduationCap, color: 'bg-blue-500' },
    { id: 'oficio', label: 'Oficio', icon: HardHat, color: 'bg-orange-500' },
];

export function HomePage() {
    const navigate = useNavigate();
    const { professionals } = useProfessionals(); 
    
    // Random select 4 professionals as "Recientes" for the demo
    const recents = professionals.slice(0, 4);

    return (
        <div className="pb-24 pt-4 px-4 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center font-black text-slate-900 text-lg">
                    S
                </div>
                <h1 className="text-xl font-black text-slate-900">
                    Soy<span className="text-amber-500">Profesional</span>
                </h1>
            </div>

            <p className="text-slate-500 text-sm mb-4">Encontrá lo que buscás en tu localidad</p>

            {/* Search Inputs */}
            <div className="space-y-3 mb-8">
                {/* Location Input */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <MapPin className="text-amber-500" size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Ej: San Martín de los Andes..."
                        className="w-full bg-white pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-slate-800 placeholder:text-slate-400 transition-all font-medium text-sm"
                        onClick={() => navigate('/search')} // Jump to search page
                        readOnly
                    />
                </div>
                
                {/* Text Search Input */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="text-slate-400" size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar albañil, electricista..."
                        className="w-full bg-white pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-slate-800 placeholder:text-slate-400 transition-all font-medium text-sm"
                        onClick={() => navigate('/search')}
                        readOnly
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="mb-8">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Categorías</h2>
                <div className="grid grid-cols-2 gap-4">
                    {MAIN_CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => navigate(`/search?category=${cat.id}`)}
                            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all flex flex-col items-center justify-center gap-3 group"
                        >
                            <div className={`${cat.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/5 group-active:scale-95 transition-transform`}>
                                <cat.icon size={26} strokeWidth={2.5} />
                            </div>
                            <span className="font-bold text-slate-700 text-sm">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Recents */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Recientes</h2>
                    <button 
                        onClick={() => navigate('/search')} 
                        className="text-amber-500 font-semibold text-sm hover:text-amber-600 transition-colors"
                    >
                        Ver todos →
                    </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recents.map((pro) => (
                        <ProfessionalCard key={pro.id} professional={pro} />
                    ))}
                </div>
            </div>
        </div>
    );
}
