import { Search, MapPin, X, Briefcase, ClipboardList, Grid3X3, ChevronRight, ChevronLeft, Star, Users } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { CATEGORIES } from '../../data/mockCategories';
import { MOCK_PROFESSIONALS } from '../../data/mockUsers';
import type { Category, Service } from '../../data/mockCategories';
import type { Professional } from '../../data/mockUsers';
import clsx from 'clsx';

// Mock database of cities
const CITIES = [
    { name: "Bahía Blanca, Buenos Aires", lat: -38.7183, lng: -62.2663 },
    { name: "Bahía San Blas, Buenos Aires", lat: -40.5500, lng: -62.2300 },
    { name: "Buenos Aires, CABA", lat: -34.6037, lng: -58.3816 },
    { name: "Punta Alta, Buenos Aires", lat: -38.8779, lng: -62.0725 },
    { name: "Monte Hermoso, Buenos Aires", lat: -38.9833, lng: -61.2833 },
    { name: "Mar del Plata, Buenos Aires", lat: -38.0055, lng: -57.5426 },
    { name: "La Plata, Buenos Aires", lat: -34.9214, lng: -57.9545 },
    { name: "Córdoba, Córdoba", lat: -31.4201, lng: -64.1888 },
    { name: "Rosario, Santa Fe", lat: -32.9442, lng: -60.6505 },
];

type MainTab = 'ciudad' | 'profesional';
type FilterTab = 'servicio' | 'tarea' | 'categoria';

interface MapSearchProps {
    onSelectLocation: (lat: number, lng: number) => void;
    onSelectProfessional: (professional: Professional) => void;
    onFilterApplied?: (filterType: FilterTab, value: string) => void;
}

export function MapSearch({ onSelectLocation, onSelectProfessional, onFilterApplied }: MapSearchProps) {
    const [mainTab, setMainTab] = useState<MainTab>('ciudad');
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Professional filter state
    const [filterTab, setFilterTab] = useState<FilterTab>('servicio');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    // City search
    const citySuggestions = query.length >= 2
        ? CITIES.filter(city => city.name.toLowerCase().includes(query.toLowerCase()))
        : [];

    // Professional search
    const professionalSuggestions = query.length >= 2
        ? MOCK_PROFESSIONALS.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.trade.toLowerCase().includes(query.toLowerCase()) ||
            p.skills.some(s => s.toLowerCase().includes(query.toLowerCase()))
        )
        : [];

    // Filter data
    const allServices = CATEGORIES.flatMap(cat => cat.services);
    const allTasks = allServices.flatMap(svc => svc.tasks);
    const filteredServices = allServices.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase())
    );
    const filteredTasks = allTasks.filter(t =>
        t.name.toLowerCase().includes(query.toLowerCase())
    );

    // Handle outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelectCity = (city: typeof CITIES[0]) => {
        setQuery(city.name);
        setIsOpen(false);
        onSelectLocation(city.lat, city.lng);
    };

    const handleSelectPro = (pro: Professional) => {
        setQuery(pro.name);
        setIsOpen(false);
        onSelectProfessional(pro);
        onSelectLocation(pro.lat, pro.lng);
    };

    const handleSelectFilterItem = (name: string) => {
        setQuery(name);
        setIsOpen(false);
        onFilterApplied?.(filterTab, name);
    };

    const handleClear = () => {
        setQuery('');
        setIsOpen(false);
        setSelectedCategory(null);
        setSelectedService(null);
    };

    const handleTabChange = (tab: MainTab) => {
        setMainTab(tab);
        setQuery('');
        setSelectedCategory(null);
        setSelectedService(null);
        setIsOpen(true);
    };

    const handleFilterTabChange = (tab: FilterTab) => {
        setFilterTab(tab);
        setQuery('');
        setSelectedCategory(null);
        setSelectedService(null);
    };

    const filterTabs = [
        { id: 'servicio' as FilterTab, label: 'Servicio', icon: Briefcase, desc: 'Por profesión' },
        { id: 'tarea' as FilterTab, label: 'Tarea', icon: ClipboardList, desc: 'Por actividad' },
        { id: 'categoria' as FilterTab, label: 'Categoría', icon: Grid3X3, desc: 'Por rubro' },
    ];

    const showDropdown = isOpen && (
        mainTab === 'profesional' ||
        (mainTab === 'ciudad' && (citySuggestions.length > 0 || query.length >= 2))
    );

    return (
        <div ref={wrapperRef} className="relative w-full pointer-events-auto">
            {/* Search Input */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={mainTab === 'ciudad' ? 'Buscar ciudad o localidad...' : 'Buscar profesional o servicio...'}
                    className="w-full bg-white pl-10 pr-10 py-3 rounded-2xl shadow-lg border-none outline-none ring-2 ring-transparent focus:ring-emerald-500/30 text-slate-800 placeholder:text-slate-400 transition-all font-medium text-sm"
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Dropdown Panel */}
            {showDropdown && (
                <div className="absolute top-14 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 max-h-[70vh] flex flex-col">
                    {/* Main Tabs */}
                    <div className="flex border-b border-slate-100 shrink-0">
                        <button
                            onClick={() => handleTabChange('ciudad')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-all relative",
                                mainTab === 'ciudad'
                                    ? "text-emerald-600"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <MapPin size={14} />
                            Ciudad
                            {mainTab === 'ciudad' && (
                                <div className="absolute bottom-0 left-4 right-4 h-[3px] bg-emerald-500 rounded-full" />
                            )}
                        </button>
                        <button
                            onClick={() => handleTabChange('profesional')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-all relative",
                                mainTab === 'profesional'
                                    ? "text-emerald-600"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Users size={14} />
                            Profesional
                            {mainTab === 'profesional' && (
                                <div className="absolute bottom-0 left-4 right-4 h-[3px] bg-emerald-500 rounded-full" />
                            )}
                        </button>
                    </div>

                    {/* ===== CITY TAB ===== */}
                    {mainTab === 'ciudad' && (
                        <div className="overflow-y-auto py-1">
                            {citySuggestions.length > 0 ? (
                                citySuggestions.map((city) => (
                                    <button
                                        key={city.name}
                                        onClick={() => handleSelectCity(city)}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 active:bg-emerald-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-none"
                                    >
                                        <div className="bg-emerald-50 p-2 rounded-full text-emerald-500 shrink-0">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">{city.name.split(',')[0]}</p>
                                            <p className="text-xs text-slate-400">{city.name.split(',')[1]}</p>
                                        </div>
                                    </button>
                                ))
                            ) : query.length >= 2 ? (
                                <div className="p-4 text-center">
                                    <p className="text-sm text-slate-400">No encontramos esa localidad</p>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {/* ===== PROFESSIONAL TAB ===== */}
                    {mainTab === 'profesional' && (
                        <div className="flex flex-col overflow-hidden">
                            {/* Filter sub-tabs */}
                            <div className="flex gap-1.5 p-3 pb-2 shrink-0 border-b border-slate-50">
                                {filterTabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleFilterTabChange(tab.id)}
                                        className={clsx(
                                            "flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-medium transition-all border",
                                            filterTab === tab.id
                                                ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm"
                                                : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                                        )}
                                    >
                                        <tab.icon size={14} />
                                        <span className="font-bold text-[11px]">{tab.label}</span>
                                        <span className="text-[9px] opacity-70 leading-none">{tab.desc}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Results area */}
                            <div className="overflow-y-auto flex-1 max-h-[45vh]">

                                {/* Direct professional search results (always show if query matches) */}
                                {query.length >= 2 && professionalSuggestions.length > 0 && (
                                    <div className="border-b border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-4 pt-3 pb-1">
                                            Profesionales encontrados
                                        </p>
                                        {professionalSuggestions.map(pro => (
                                            <button
                                                key={pro.id}
                                                onClick={() => handleSelectPro(pro)}
                                                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 active:bg-emerald-50 flex items-center gap-3 transition-colors"
                                            >
                                                <img
                                                    src={pro.image}
                                                    alt={pro.name}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-800 text-sm truncate">{pro.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-emerald-600 font-medium">{pro.trade}</span>
                                                        <span className="flex items-center gap-0.5 text-xs text-amber-500">
                                                            <Star size={10} className="fill-current" />
                                                            {pro.rating}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronRight size={14} className="text-slate-300 shrink-0" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* TAB: Servicio */}
                                {filterTab === 'servicio' && (
                                    <div className="p-3 space-y-1.5">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1 pb-1">
                                            {filteredServices.length} servicios
                                        </p>
                                        {filteredServices.map(service => (
                                            <button
                                                key={service.id}
                                                onClick={() => handleSelectFilterItem(service.name)}
                                                className="w-full text-left bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-xl p-3 flex items-center justify-between transition-all group"
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-700 group-hover:text-emerald-700 text-xs">{service.name}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">{service.tasks.length} actividades</p>
                                                </div>
                                                <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* TAB: Tarea */}
                                {filterTab === 'tarea' && (
                                    <div className="p-3 space-y-1.5">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1 pb-1">
                                            {filteredTasks.length} actividades
                                        </p>
                                        {filteredTasks.map(task => (
                                            <button
                                                key={task.id}
                                                onClick={() => handleSelectFilterItem(task.name)}
                                                className="w-full text-left bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-xl p-3 flex items-center justify-between transition-all group"
                                            >
                                                <p className="font-semibold text-slate-700 group-hover:text-emerald-700 text-xs">{task.name}</p>
                                                <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* TAB: Categoría */}
                                {filterTab === 'categoria' && !selectedCategory && (
                                    <div className="p-3 space-y-1.5">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1 pb-1">Categorías</p>
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setSelectedCategory(cat)}
                                                className="w-full text-left bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-xl p-3 flex items-center justify-between transition-all group"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <span className="text-lg">{cat.icon}</span>
                                                    <div>
                                                        <p className="font-bold text-slate-700 group-hover:text-emerald-700 text-xs">{cat.name}</p>
                                                        <p className="text-[10px] text-slate-400">{cat.services.length} servicios</p>
                                                    </div>
                                                </div>
                                                <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Categoría → Servicios drill-down */}
                                {filterTab === 'categoria' && selectedCategory && !selectedService && (
                                    <div className="p-3 space-y-1.5">
                                        <button
                                            onClick={() => setSelectedCategory(null)}
                                            className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs mb-2 hover:text-emerald-700"
                                        >
                                            <ChevronLeft size={14} />
                                            Volver a Categorías
                                        </button>
                                        <div className="flex items-center gap-2 mb-3 px-1">
                                            <span className="text-lg">{selectedCategory.icon}</span>
                                            <h3 className="text-sm font-bold text-slate-800">{selectedCategory.name}</h3>
                                        </div>
                                        {selectedCategory.services.map(svc => (
                                            <button
                                                key={svc.id}
                                                onClick={() => setSelectedService(svc)}
                                                className="w-full text-left bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-xl p-3 flex items-center justify-between transition-all group"
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-700 group-hover:text-emerald-700 text-xs">{svc.name}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">{svc.tasks.length} actividades</p>
                                                </div>
                                                <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Categoría → Servicio → Tareas drill-down */}
                                {filterTab === 'categoria' && selectedCategory && selectedService && (
                                    <div className="p-3 space-y-1.5">
                                        <button
                                            onClick={() => setSelectedService(null)}
                                            className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs mb-2 hover:text-emerald-700"
                                        >
                                            <ChevronLeft size={14} />
                                            Volver a {selectedCategory.name}
                                        </button>
                                        <h3 className="text-sm font-bold text-slate-800 mb-3 px-1">{selectedService.name}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1 pb-1">
                                            Actividades disponibles
                                        </p>
                                        {selectedService.tasks.map(task => (
                                            <button
                                                key={task.id}
                                                onClick={() => handleSelectFilterItem(task.name)}
                                                className="w-full text-left bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-xl p-3 flex items-center justify-between transition-all group"
                                            >
                                                <p className="font-semibold text-slate-700 group-hover:text-emerald-700 text-xs">{task.name}</p>
                                                <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
