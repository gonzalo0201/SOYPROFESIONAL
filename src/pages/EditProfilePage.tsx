import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Plus, X, ChevronDown, ChevronUp, Trash2, Briefcase } from 'lucide-react';
import { CATEGORIES } from '../data/mockCategories';
import clsx from 'clsx';

interface ProfessionEntry {
    id: number;
    categoryId: string;
    profession: string;
    activities: string[];
    newActivity: string;
    isCategoryOpen: boolean;
    isCollapsed: boolean;
}

let nextId = 3;

export function EditProfilePage() {
    const navigate = useNavigate();

    // Form state
    const [photo] = useState('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop');
    const [name, setName] = useState('Juan');
    const [lastName, setLastName] = useState('Pérez');
    const [email, setEmail] = useState('juan.perez@email.com');
    const [age, setAge] = useState('35');
    const [address, setAddress] = useState('Av. Colón 1234, Bahía Blanca');

    // Multiple professions
    const [professions, setProfessions] = useState<ProfessionEntry[]>([
        {
            id: 1,
            categoryId: 'hogar',
            profession: 'Mantenimiento de Parques',
            activities: ['Corte de césped', 'Poda de árboles', 'Desmalezamiento', 'Armado de riego automático'],
            newActivity: '',
            isCategoryOpen: false,
            isCollapsed: false,
        },
        {
            id: 2,
            categoryId: 'hogar',
            profession: 'Pintor',
            activities: ['Pintura de exteriores', 'Pintura de interiores', 'Barniz de deck', 'Aplicación de impermeabilizante para exteriores'],
            newActivity: '',
            isCategoryOpen: false,
            isCollapsed: false,
        },
    ]);

    const updateProfession = (id: number, updates: Partial<ProfessionEntry>) => {
        setProfessions(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const addProfession = () => {
        setProfessions(prev => [...prev, {
            id: nextId++,
            categoryId: '',
            profession: '',
            activities: [],
            newActivity: '',
            isCategoryOpen: false,
            isCollapsed: false,
        }]);
    };

    const removeProfession = (id: number) => {
        if (professions.length <= 1) return; // Keep at least one
        setProfessions(prev => prev.filter(p => p.id !== id));
    };

    const addActivity = (profId: number) => {
        const prof = professions.find(p => p.id === profId);
        if (!prof || !prof.newActivity.trim()) return;
        if (prof.activities.includes(prof.newActivity.trim())) return;
        updateProfession(profId, {
            activities: [...prof.activities, prof.newActivity.trim()],
            newActivity: '',
        });
    };

    const removeActivity = (profId: number, activity: string) => {
        const prof = professions.find(p => p.id === profId);
        if (!prof) return;
        updateProfession(profId, {
            activities: prof.activities.filter(a => a !== activity),
        });
    };

    const handleSave = () => {
        navigate(-1);
    };

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col pb-24">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-slate-100 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-900 flex-1">Editar Perfil</h1>
                <button
                    onClick={handleSave}
                    className="bg-emerald-500 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors"
                >
                    Guardar
                </button>
            </div>

            <div className="p-4 space-y-6">

                {/* Photo Section */}
                <div className="flex flex-col items-center py-4">
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                            <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <button className="absolute bottom-0 right-0 bg-emerald-500 text-white p-2.5 rounded-full shadow-lg border-2 border-white hover:bg-emerald-600 transition-colors">
                            <Camera size={16} />
                        </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-3">Toca para cambiar tu foto</p>
                </div>

                {/* Personal Info Section */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                    <h2 className="font-bold text-sm uppercase tracking-wider text-slate-500">
                        Datos Personales
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Nombre</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Apellido</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Edad</label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Dirección</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Ej: Av. Colón 1234, Bahía Blanca"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Professional Sections - Multiple */}
                {professions.map((prof, index) => {
                    const selectedCategory = CATEGORIES.find(c => c.id === prof.categoryId);
                    return (
                        <div key={prof.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            {/* Profession Header (collapsible) */}
                            <button
                                onClick={() => updateProfession(prof.id, { isCollapsed: !prof.isCollapsed })}
                                className="w-full p-5 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                            >
                                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm shrink-0">
                                    {index + 1}°
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-bold text-slate-900 text-sm">
                                            {prof.profession || 'Nueva profesión'}
                                        </h2>
                                        {selectedCategory && (
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                                                {selectedCategory.icon} {selectedCategory.name}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        {prof.activities.length} actividades
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    {professions.length > 1 && (
                                        <span
                                            onClick={(e) => { e.stopPropagation(); removeProfession(prof.id); }}
                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </span>
                                    )}
                                    {prof.isCollapsed ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronUp size={18} className="text-slate-400" />}
                                </div>
                            </button>

                            {/* Profession Content (collapsible) */}
                            {!prof.isCollapsed && (
                                <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
                                    {/* Category Selector */}
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Categoría / Rubro</label>
                                        <div className="relative">
                                            <button
                                                onClick={() => updateProfession(prof.id, { isCategoryOpen: !prof.isCategoryOpen })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 text-left flex items-center justify-between hover:border-emerald-300 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {selectedCategory && <span className="text-lg">{selectedCategory.icon}</span>}
                                                    <span className="font-medium">{selectedCategory?.name || 'Seleccionar categoría...'}</span>
                                                </div>
                                                <ChevronDown size={16} className={clsx("text-slate-400 transition-transform", prof.isCategoryOpen && "rotate-180")} />
                                            </button>

                                            {prof.isCategoryOpen && (
                                                <div className="absolute top-14 left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-1 animate-in fade-in slide-in-from-top-2">
                                                    {CATEGORIES.map(cat => (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => updateProfession(prof.id, { categoryId: cat.id, isCategoryOpen: false })}
                                                            className={clsx(
                                                                "w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-sm",
                                                                prof.categoryId === cat.id && "bg-emerald-50 text-emerald-700"
                                                            )}
                                                        >
                                                            <span className="text-lg">{cat.icon}</span>
                                                            <span className="font-medium">{cat.name}</span>
                                                            <span className="text-xs text-slate-400 ml-auto">{cat.services.length} servicios</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Profession Name */}
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Profesión / Ocupación</label>
                                        <input
                                            type="text"
                                            value={prof.profession}
                                            onChange={(e) => updateProfession(prof.id, { profession: e.target.value })}
                                            placeholder="Ej: Cerrajero, Plomero, Pintor..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all placeholder:text-slate-400"
                                        />
                                    </div>

                                    {/* Activities */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-semibold text-slate-500">Actividades que realizo</label>
                                            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                                                {prof.activities.length}
                                            </span>
                                        </div>

                                        {/* Activity Tags */}
                                        <div className="flex flex-wrap gap-2">
                                            {prof.activities.map(activity => (
                                                <span
                                                    key={activity}
                                                    className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-2 rounded-xl flex items-center gap-2 border border-slate-200"
                                                >
                                                    {activity}
                                                    <button
                                                        onClick={() => removeActivity(prof.id, activity)}
                                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>

                                        {/* Add Activity Input */}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={prof.newActivity}
                                                onChange={(e) => updateProfession(prof.id, { newActivity: e.target.value })}
                                                onKeyDown={(e) => e.key === 'Enter' && addActivity(prof.id)}
                                                placeholder="Agregar actividad..."
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all placeholder:text-slate-400"
                                            />
                                            <button
                                                onClick={() => addActivity(prof.id)}
                                                disabled={!prof.newActivity.trim()}
                                                className={clsx(
                                                    "p-3 rounded-xl transition-all font-bold",
                                                    prof.newActivity.trim()
                                                        ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md"
                                                        : "bg-slate-100 text-slate-300 cursor-not-allowed"
                                                )}
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>

                                        {/* Suggestions */}
                                        {selectedCategory && (
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">
                                                    Sugerencias para {selectedCategory.name}
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {selectedCategory.services
                                                        .flatMap(s => s.tasks)
                                                        .filter(t => !prof.activities.includes(t.name))
                                                        .slice(0, 6)
                                                        .map(task => (
                                                            <button
                                                                key={task.id}
                                                                onClick={() => updateProfession(prof.id, {
                                                                    activities: [...prof.activities, task.name]
                                                                })}
                                                                className="bg-emerald-50 text-emerald-700 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                                                            >
                                                                <Plus size={10} />
                                                                {task.name}
                                                            </button>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Add Profession Button */}
                <button
                    onClick={addProfession}
                    className="w-full py-4 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 text-emerald-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 hover:border-emerald-300 transition-all active:scale-[0.98]"
                >
                    <Briefcase size={18} />
                    Añadir otra profesión o rubro
                </button>
            </div>
        </div>
    );
}
