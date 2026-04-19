import { Search, MapPin, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProfessionals } from '../hooks/useProfessionals';
import { ProfessionalCard } from '../components/ProfessionalCard';
import clsx from 'clsx';

const CATEGORIES = ['Todos', 'Servicios', 'Técnicos', 'Profesionales', 'Oficios'];

export function SearchPage() {
    const { professionals, isLoading } = useProfessionals();
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');
    
    // Map the simple IDs (servicio, tecnico) to the plural labels
    const getInitialCategory = () => {
        if (!categoryParam) return 'Todos';
        if (categoryParam === 'servicio') return 'Servicios';
        if (categoryParam === 'tecnico') return 'Técnicos';
        if (categoryParam === 'profesional') return 'Profesionales';
        if (categoryParam === 'oficio') return 'Oficios';
        return 'Todos';
    };

    const initialCategory = getInitialCategory();

    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState(initialCategory);

    const filteredPros = professionals.filter(pro => {
        const matchesSearch = pro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pro.trade.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (pro.skills && pro.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));
            
        let matchesCategory = true;
        if (activeCategory !== 'Todos') {
            const trade = pro.trade.toLowerCase();
            if (activeCategory === 'Servicios') matchesCategory = ['jardinero', 'limpieza', 'niñera', 'flete'].some(t => trade.includes(t));
            else if (activeCategory === 'Técnicos') matchesCategory = ['aire', 'pc', 'celular', 'electrodomésticos'].some(t => trade.includes(t));
            else if (activeCategory === 'Profesionales') matchesCategory = ['abogado', 'contador', 'arquitecto', 'fotógrafo'].some(t => trade.includes(t));
            else if (activeCategory === 'Oficios') matchesCategory = ['albañil', 'electricista', 'gasista', 'plomero', 'carpintero'].some(t => trade.includes(t));
        }

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col pb-24">
            {/* Header & Search */}
            <div className="bg-slate-50 p-4 sticky top-0 z-10">
                <h1 className="text-xl font-bold text-slate-900 mb-4">Explorar</h1>

                <div className="space-y-3">
                    {/* Location Input */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <MapPin className="text-emerald-500" size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Filtrar por localidad..."
                            className="w-full bg-white pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-slate-800 placeholder:text-slate-400 text-sm font-medium transition-all"
                        />
                    </div>
                
                    {/* Text Search Input */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="text-slate-400" size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, oficio o actividad..."
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

                {/* Categories Scrollable Row */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={clsx(
                                "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold border transition-colors",
                                activeCategory === cat 
                                    ? "bg-emerald-500 text-white border-emerald-500" 
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results List */}
            {isLoading ? (
                <div className="flex flex-col items-center py-12 gap-3">
                    <Loader2 size={28} className="text-emerald-500 animate-spin" />
                    <p className="text-slate-400 text-sm">Cargando anuncios...</p>
                </div>
            ) : (
                <div className="px-4 space-y-4">
                    {filteredPros.length > 0 ? (
                        <>
                            {filteredPros.map(pro => (
                                <ProfessionalCard key={pro.id} professional={pro} />
                            ))}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-slate-500 font-medium mb-2">No se encontraron resultados para esta búsqueda.</p>
                            <button 
                                onClick={() => setSearchTerm('')} 
                                className="text-emerald-500 font-bold text-sm"
                            >
                                Limpiar búsqueda
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
