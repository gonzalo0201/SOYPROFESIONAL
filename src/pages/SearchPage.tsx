import { Search, MapPin, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProfessionals } from '../hooks/useProfessionals';
import { ProfessionalCard } from '../components/ProfessionalCard';
import clsx from 'clsx';

const CATEGORIES = ['Todos', 'Servicio', 'Técnico', 'Profesional', 'Oficio'];

export function SearchPage() {
    const { professionals, isLoading } = useProfessionals();
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');
    
    const initialCategory = categoryParam 
        ? CATEGORIES.find(c => c.toLowerCase().includes(categoryParam.toLowerCase())) || 'Todos'
        : 'Todos';

    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState(initialCategory);

    const filteredPros = professionals.filter(pro => {
        const matchesSearch = pro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pro.trade.toLowerCase().includes(searchTerm.toLowerCase());
            
        let matchesCategory = true;
        if (activeCategory !== 'Todos') {
            const trade = pro.trade.toLowerCase();
            if (activeCategory === 'Servicio') matchesCategory = ['jardinero', 'limpieza', 'niñera', 'flete'].some(t => trade.includes(t));
            else if (activeCategory === 'Técnico') matchesCategory = ['aire', 'pc', 'celular', 'electrodomésticos'].some(t => trade.includes(t));
            else if (activeCategory === 'Profesional') matchesCategory = ['abogado', 'contador', 'arquitecto', 'fotógrafo'].some(t => trade.includes(t));
            else if (activeCategory === 'Oficio') matchesCategory = ['albañil', 'electricista', 'gasista', 'plomero', 'carpintero'].some(t => trade.includes(t));
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
                            placeholder="Buscar anuncios..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-slate-800 placeholder:text-slate-400 text-sm font-medium transition-all"
                        />
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
                    {filteredPros.map(pro => (
                        <ProfessionalCard key={pro.id} professional={pro} />
                    ))}
                    {filteredPros.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-slate-500 font-medium">No se encontraron resultados para esta categoría o búsqueda.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
