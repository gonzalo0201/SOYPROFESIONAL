import { useState } from 'react';
import { X, Briefcase, ClipboardList, Grid3X3, ChevronRight, ChevronLeft, Search } from 'lucide-react';
import { CATEGORIES } from '../../data/mockCategories';
import type { Category, Service } from '../../data/mockCategories';
import clsx from 'clsx';

type FilterTab = 'servicio' | 'tarea' | 'categoria';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyFilter: (filterType: FilterTab, value: string) => void;
}

export function FilterModal({ isOpen, onClose, onApplyFilter }: FilterModalProps) {
    const [activeTab, setActiveTab] = useState<FilterTab>('servicio');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    if (!isOpen) return null;

    // Collect all services from all categories
    const allServices = CATEGORIES.flatMap(cat => cat.services);

    // Collect all tasks from all services
    const allTasks = allServices.flatMap(svc => svc.tasks);

    // Filter items based on search query
    const filteredServices = allServices.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredTasks = allTasks.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectItem = (name: string) => {
        onApplyFilter(activeTab, name);
        onClose();
    };

    const handleReset = () => {
        setSearchQuery('');
        setSelectedCategory(null);
        setSelectedService(null);
    };

    const tabs = [
        { id: 'servicio' as FilterTab, label: 'Servicio', icon: Briefcase, desc: 'Por profesión' },
        { id: 'tarea' as FilterTab, label: 'Tarea', icon: ClipboardList, desc: 'Por actividad' },
        { id: 'categoria' as FilterTab, label: 'Categoría', icon: Grid3X3, desc: 'Por rubro' },
    ];

    return (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="bg-white w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 pointer-events-auto flex flex-col animate-in slide-in-from-bottom-10 duration-300">

                {/* Header */}
                <div className="p-5 pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900">Filtros de Búsqueda</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); handleReset(); }}
                                className={clsx(
                                    "flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all text-xs font-medium",
                                    activeTab === tab.id
                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                        : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                                )}
                            >
                                <tab.icon size={18} />
                                <span className="font-bold">{tab.label}</span>
                                <span className="text-[10px] opacity-70">{tab.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search within filter */}
                <div className="px-5 pt-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={
                                activeTab === 'servicio' ? 'Buscar servicio...' :
                                    activeTab === 'tarea' ? 'Buscar tarea o actividad...' :
                                        'Buscar categoría...'
                            }
                            className="w-full bg-slate-100 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 pt-3">

                    {/* TAB 1: By Service/Profession */}
                    {activeTab === 'servicio' && (
                        <div className="space-y-2">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">
                                {filteredServices.length} servicios encontrados
                            </p>
                            {filteredServices.map(service => (
                                <button
                                    key={service.id}
                                    onClick={() => handleSelectItem(service.name)}
                                    className="w-full text-left bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-xl p-3.5 flex items-center justify-between transition-all group"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-800 group-hover:text-emerald-700 text-sm">{service.name}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{service.tasks.length} actividades</p>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* TAB 2: By Task/Activity */}
                    {activeTab === 'tarea' && (
                        <div className="space-y-2">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">
                                {filteredTasks.length} actividades encontradas
                            </p>
                            {filteredTasks.map(task => (
                                <button
                                    key={task.id}
                                    onClick={() => handleSelectItem(task.name)}
                                    className="w-full text-left bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-xl p-3.5 flex items-center justify-between transition-all group"
                                >
                                    <p className="font-semibold text-slate-800 group-hover:text-emerald-700 text-sm">{task.name}</p>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* TAB 3: By Category */}
                    {activeTab === 'categoria' && !selectedCategory && (
                        <div className="space-y-2">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">Categorías</p>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat)}
                                    className="w-full text-left bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-xl p-4 flex items-center justify-between transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{cat.icon}</span>
                                        <div>
                                            <p className="font-bold text-slate-800 group-hover:text-emerald-700">{cat.name}</p>
                                            <p className="text-xs text-slate-400">{cat.services.length} servicios</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Category → Services drill-down */}
                    {activeTab === 'categoria' && selectedCategory && !selectedService && (
                        <div className="space-y-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mb-3 hover:text-emerald-700"
                            >
                                <ChevronLeft size={16} />
                                Volver a Categorías
                            </button>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">{selectedCategory.icon}</span>
                                <h3 className="text-lg font-bold text-slate-900">{selectedCategory.name}</h3>
                            </div>
                            {selectedCategory.services.map(svc => (
                                <button
                                    key={svc.id}
                                    onClick={() => setSelectedService(svc)}
                                    className="w-full text-left bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-xl p-3.5 flex items-center justify-between transition-all group"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-800 group-hover:text-emerald-700 text-sm">{svc.name}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{svc.tasks.length} actividades</p>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Category → Service → Tasks drill-down */}
                    {activeTab === 'categoria' && selectedCategory && selectedService && (
                        <div className="space-y-2">
                            <button
                                onClick={() => setSelectedService(null)}
                                className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mb-3 hover:text-emerald-700"
                            >
                                <ChevronLeft size={16} />
                                Volver a {selectedCategory.name}
                            </button>
                            <h3 className="text-lg font-bold text-slate-900 mb-4">{selectedService.name}</h3>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">
                                Actividades disponibles
                            </p>
                            {selectedService.tasks.map(task => (
                                <button
                                    key={task.id}
                                    onClick={() => handleSelectItem(task.name)}
                                    className="w-full text-left bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-xl p-3.5 flex items-center justify-between transition-all group"
                                >
                                    <p className="font-semibold text-slate-800 group-hover:text-emerald-700 text-sm">{task.name}</p>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
