import { useState } from 'react';
import { ArrowLeft, Camera, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { MAIN_CATEGORIES } from './HomePage';

type Step = 1 | 2 | 3;

export function PostPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>(1);

    // Form State
    const [category, setCategory] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [subcategory, setSubcategory] = useState('plomeria');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [name, setName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [email, setEmail] = useState('');

    const nextStep = () => {
        if (step === 1 && !category) return;
        if (step === 2 && (!title || !description || !location || !name || !whatsapp)) return;
        setStep((prev) => (prev + 1) as Step);
    };

    const prevStep = () => {
        if (step === 1) navigate(-1);
        else setStep((prev) => (prev - 1) as Step);
    };

    const handlePublish = () => {
        // Mock publish
        alert('¡Anuncio publicado con éxito!');
        navigate('/');
    };

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col pb-24">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={prevStep} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={22} className="text-slate-800" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900">Publicar anuncio</h1>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-2">
                    <div className="flex-1 flex flex-col gap-2">
                        <div className={clsx("h-1 rounded-full", step >= 1 ? "bg-amber-400" : "bg-slate-200")} />
                        <span className={clsx("text-[10px] text-center font-bold", step >= 1 ? "text-slate-800" : "text-slate-400")}>Categoría</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                        <div className={clsx("h-1 rounded-full", step >= 2 ? "bg-amber-400" : "bg-slate-200")} />
                        <span className={clsx("text-[10px] text-center font-bold", step >= 2 ? "text-slate-800" : "text-slate-400")}>Detalles</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                        <div className={clsx("h-1 rounded-full", step >= 3 ? "bg-amber-400" : "bg-slate-200")} />
                        <span className={clsx("text-[10px] text-center font-bold", step >= 3 ? "text-slate-800" : "text-slate-400")}>Fotos</span>
                    </div>
                </div>
            </div>

            {/* Step 1: Categoría */}
            {step === 1 && (
                <div className="p-4 flex-1">
                    <p className="text-slate-600 font-medium mb-4">¿Qué querés publicar?</p>
                    <div className="grid grid-cols-2 gap-4">
                        {MAIN_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setCategory(cat.id)}
                                className={clsx(
                                    "bg-white rounded-2xl p-6 shadow-sm border flex flex-col items-center justify-center gap-3 transition-all",
                                    category === cat.id ? "border-amber-400 ring-2 ring-amber-400/20" : "border-slate-100 hover:border-amber-200"
                                )}
                            >
                                <div className={clsx(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md",
                                    cat.color
                                )}>
                                    <cat.icon size={26} strokeWidth={2.5} />
                                </div>
                                <span className="font-bold text-slate-700 text-sm">{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={nextStep}
                            disabled={!category}
                            className="w-full bg-[#f6d061] hover:bg-[#ebd061] text-slate-800 py-3.5 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                        >
                            Siguiente →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Detalles */}
            {step === 2 && (
                <div className="p-4 flex-1 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Gasista matriculado, Plomero 24hs..."
                            className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-amber-400 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Subcategoría</label>
                        <select
                            value={subcategory}
                            onChange={(e) => setSubcategory(e.target.value)}
                            className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-amber-400 text-sm appearance-none"
                        >
                            <option value="plomeria">Plomería</option>
                            <option value="electricidad">Electricidad</option>
                            <option value="gas">Gas</option>
                            <option value="jardineria">Jardinería</option>
                            <option value="limpieza">Limpieza</option>
                            <option value="construccion">Construcción</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describí tus servicios, años de experiencia, zonas de cobertura..."
                            rows={4}
                            className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-amber-400 text-sm resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Localidad</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Ej: San Martín de los Andes"
                            className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-amber-400 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Datos de contacto</label>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Tu nombre"
                                className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-amber-400 text-sm"
                            />
                            <input
                                type="tel"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                placeholder="WhatsApp (ej: 5491112345678)"
                                className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-amber-400 text-sm"
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email (opcional)"
                                className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-amber-400 text-sm"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={prevStep}
                            className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 py-3.5 rounded-xl font-bold transition-colors uppercase tracking-wide"
                        >
                            Atrás
                        </button>
                        <button
                            onClick={nextStep}
                            disabled={!title || !description || !location || !name || !whatsapp}
                            className="flex-1 bg-[#f6d061] hover:bg-[#ebd061] text-slate-800 py-3.5 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                        >
                            Siguiente →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Fotos & Resumen */}
            {step === 3 && (
                <div className="p-4 flex-1 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Fotos (0/5)</label>
                        <button className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors text-slate-500">
                            <Camera size={24} />
                            <span className="text-xs font-bold">Agregar</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-3 text-sm">Resumen</h3>
                        <div className="space-y-2 text-sm">
                            <p><span className="text-slate-500 font-medium">Categoría:</span> {MAIN_CATEGORIES.find(c => c.id === category)?.label}</p>
                            <p><span className="text-slate-500 font-medium">Subcategoría:</span> <span className="capitalize">{subcategory}</span></p>
                            <p><span className="text-slate-500 font-medium">Título:</span> {title}</p>
                            <p><span className="text-slate-500 font-medium">Localidad:</span> {location}</p>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={prevStep}
                            className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} /> Atrás
                        </button>
                        <button
                            onClick={handlePublish}
                            className="flex-[2] bg-[#ffc107] hover:bg-[#e0a800] text-slate-900 py-3.5 rounded-xl font-black transition-colors flex items-center justify-center gap-2 shadow-amber-500/20 shadow-lg"
                        >
                            <Check size={18} strokeWidth={3} /> Publicar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
