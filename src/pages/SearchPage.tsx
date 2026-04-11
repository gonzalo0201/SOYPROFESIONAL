import { Search, Filter, Trophy, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useProfessionals } from '../hooks/useProfessionals';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { RankingModal } from '../components/search/RankingModal';
import { FilterModal } from '../components/search/FilterModal';

export function SearchPage() {
    const { professionals, isLoading } = useProfessionals();
    const [searchTerm, setSearchTerm] = useState('');
    const [isRankingOpen, setIsRankingOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const filteredPros = professionals.filter(pro => {
        const matchesSearch = pro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pro.trade.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (activeFilter && activeFilter.toLowerCase().includes(pro.trade.toLowerCase()));
        return matchesSearch;
    });

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col pb-24">
            {/* Header & Search */}
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10 border-b border-slate-100">
                <h1 className="text-xl font-bold text-slate-900 mb-3">Buscar Profesionales</h1>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Ej: Aire acondicionado, plomero..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-100 border-none rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm placeholder:text-slate-500"
                        />
                    </div>
                    {/* Ranking Button */}
                    <button
                        onClick={() => setIsRankingOpen(true)}
                        className="bg-amber-50 p-3 rounded-xl text-amber-600 hover:bg-amber-100 transition-colors relative border border-amber-100"
                    >
                        <Trophy size={20} />
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                        </span>
                    </button>
                    {/* Filter Button */}
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`p-3 rounded-xl transition-colors relative ${activeFilter
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        <Filter size={20} />
                        {activeFilter && (
                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Active Filter Badge */}
            {activeFilter && (
                <div className="px-4 pt-3">
                    <div className="flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            {activeFilter}
                            <button onClick={() => setActiveFilter(null)} className="hover:text-emerald-900">
                                <X size={12} />
                            </button>
                        </span>
                    </div>
                </div>
            )}

            {/* Results Count */}
            <div className="px-4 pt-3 pb-2">
                <p className="text-slate-500 text-sm">
                    {isLoading ? 'Cargando...' : `${filteredPros.length} profesionales en Buenos Aires`}
                </p>
            </div>

            {/* Results List */}
            {isLoading ? (
                <div className="flex flex-col items-center py-12 gap-3">
                    <Loader2 size={28} className="text-emerald-500 animate-spin" />
                    <p className="text-slate-400 text-sm">Cargando profesionales...</p>
                </div>
            ) : (
                <div className="p-4 space-y-4">
                    {filteredPros.map(pro => (
                        <ProfessionalCard key={pro.id} professional={pro} />
                    ))}
                </div>
            )}

            {/* Modals */}
            <RankingModal isOpen={isRankingOpen} onClose={() => setIsRankingOpen(false)} />
            <FilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onApplyFilter={(_type, value) => {
                    setActiveFilter(value);
                    setSearchTerm(value);
                }}
            />
        </div>
    );
}
