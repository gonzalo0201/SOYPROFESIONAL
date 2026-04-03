import { Camera, Image as ImageIcon, Send, Clock, Plus, Heart, MessageCircle, MoreHorizontal, Grid3X3, CalendarDays, X, Tag } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PORTFOLIO_CATEGORIES, MOCK_PORTFOLIO } from '../data/mockPortfolio';
import type { PortfolioCategory } from '../data/mockPortfolio';
import clsx from 'clsx';

// Use centralized portfolio data for "My Portfolio" feed
const MY_PORTFOLIO = MOCK_PORTFOLIO.filter(item => item.professionalId === 1).map(item => ({
    id: item.id,
    image: item.images[0],
    caption: item.caption,
    date: item.date,
    likes: item.likes,
    comments: item.comments,
    category: item.category,
    tags: item.tags,
}));

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

type TabType = 'historia' | 'portafolio';

export function PostPage() {
    const [statusText, setStatusText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('historia');
    const [portfolioCaption, setPortfolioCaption] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<PortfolioCategory>('terminado');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const navigate = useNavigate();

    const handlePostStory = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            alert('¡Historia publicada! Será visible por 24hs en el mapa.');
            navigate('/');
        }, 1500);
    };

    const handlePostPortfolio = () => {
        if (!selectedImage) return;
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setSelectedImage(null);
            setPortfolioCaption('');
            setSelectedCategory('terminado');
            setTags([]);
            setTagInput('');
            alert('¡Trabajo publicado en tu portafolio!');
        }, 1500);
    };

    const addTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
            setTags(prev => [...prev, trimmed]);
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setTags(prev => prev.filter(t => t !== tag));
    };

    // Simulate selecting an image
    const handleSelectImage = () => {
        const sampleImages = [
            'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=600&fit=crop',
        ];
        setSelectedImage(sampleImages[Math.floor(Math.random() * sampleImages.length)]);
    };

    const tabs = [
        { id: 'historia' as TabType, label: 'Historia', icon: Clock, desc: 'Visible 24hs' },
        { id: 'portafolio' as TabType, label: 'Portafolio', icon: Grid3X3, desc: 'Permanente' },
    ];

    const getCategoryEmoji = (category: string) => {
        switch (category) {
            case 'antes-despues': return '🔄';
            case 'en-progreso': return '🔨';
            case 'terminado': return '✅';
            default: return '📸';
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col pb-24">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-slate-100 sticky top-0 z-10 shadow-sm">
                <h1 className="text-xl font-bold text-slate-900 mb-3">Publicar</h1>

                {/* Tabs */}
                <div className="flex gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "flex-1 py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border",
                                activeTab === tab.id
                                    ? "bg-slate-800 text-white border-slate-800 shadow-md"
                                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            )}
                        >
                            <tab.icon size={16} />
                            <span>{tab.label}</span>
                            <span className={clsx(
                                "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                                activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
                            )}>
                                {tab.desc}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* HISTORIA TAB */}
            {activeTab === 'historia' && (
                <div className="flex-1 flex flex-col p-4">

                    {/* Story Creator */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center">
                        <div className="bg-slate-100 p-5 rounded-full mb-4">
                            <Camera size={36} className="text-slate-400" />
                        </div>

                        <h2 className="text-lg font-bold text-slate-800 mb-1">Mostrá tu trabajo</h2>
                        <p className="text-slate-500 text-sm text-center max-w-xs mb-6">
                            Compartí fotos y videos de tus trabajos para que potenciales clientes vean lo que hacés.
                        </p>

                        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full mb-5 border border-amber-100 font-medium">
                            <Clock size={12} />
                            La historia será visible por 24 horas en el mapa
                        </div>

                        <div className="flex gap-3 w-full max-w-sm">
                            <button className="flex-1 bg-slate-800 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-slate-200 text-sm">
                                <Camera size={18} />
                                Cámara
                            </button>
                            <button className="flex-1 bg-white text-slate-700 border border-slate-200 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm hover:bg-slate-50">
                                <ImageIcon size={18} />
                                Galería
                            </button>
                        </div>
                    </div>

                    {/* Status Text */}
                    <div className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            O escribí qué estás haciendo ahora:
                        </label>
                        <form onSubmit={handlePostStory} className="flex gap-2">
                            <input
                                type="text"
                                value={statusText}
                                onChange={(e) => setStatusText(e.target.value)}
                                placeholder="Ej: Terminando instalación en Palermo..."
                                className="flex-1 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 text-sm transition-all placeholder:text-slate-400"
                                required
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-emerald-500 text-white p-3 rounded-xl disabled:opacity-50 active:scale-95 transition-transform hover:bg-emerald-600"
                            >
                                {isSubmitting
                                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <Send size={20} />
                                }
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* PORTAFOLIO TAB */}
            {activeTab === 'portafolio' && (
                <div className="flex-1 flex flex-col">

                    {/* Upload Section */}
                    <div className="p-4">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                            <h2 className="font-bold text-slate-900 text-sm mb-3">Publicar nuevo trabajo</h2>

                            {selectedImage ? (
                                <div className="space-y-3">
                                    <div className="relative rounded-xl overflow-hidden">
                                        <img
                                            src={selectedImage}
                                            alt="Selected"
                                            className="w-full h-48 object-cover"
                                        />
                                        <button
                                            onClick={() => setSelectedImage(null)}
                                            className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full text-xs font-bold hover:bg-black/70"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* Category Selector */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 mb-2 block">Tipo de publicación</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {PORTFOLIO_CATEGORIES.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setSelectedCategory(cat.id)}
                                                    className={clsx(
                                                        "py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border",
                                                        selectedCategory === cat.id
                                                            ? "bg-slate-800 text-white border-slate-800 shadow-md"
                                                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                                                    )}
                                                >
                                                    <span>{cat.emoji}</span>
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                        {selectedCategory === 'antes-despues' && (
                                            <p className="text-[10px] text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg mt-2 border border-purple-100 font-medium">
                                                💡 Tip: Subí 2 fotos para mostrar el antes y después
                                            </p>
                                        )}
                                    </div>

                                    <input
                                        type="text"
                                        value={portfolioCaption}
                                        onChange={(e) => setPortfolioCaption(e.target.value)}
                                        placeholder="Escribí una descripción del trabajo..."
                                        className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 text-sm transition-all placeholder:text-slate-400"
                                    />

                                    {/* Tags Input */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                                            <Tag size={12} />
                                            Tags ({tags.length}/5)
                                        </label>
                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-2">
                                                {tags.map(tag => (
                                                    <span key={tag} className="bg-emerald-50 text-emerald-700 text-[11px] font-medium px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                                                        {tag}
                                                        <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={10} /></button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                                placeholder="Ej: Plomería, Remodelación..."
                                                className="flex-1 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs transition-all placeholder:text-slate-400"
                                            />
                                            <button
                                                onClick={addTag}
                                                disabled={!tagInput.trim() || tags.length >= 5}
                                                className={clsx(
                                                    "px-3 py-2 rounded-xl text-xs font-bold transition-all",
                                                    tagInput.trim() && tags.length < 5
                                                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                                        : "bg-slate-100 text-slate-300 cursor-not-allowed"
                                                )}
                                            >
                                                Agregar
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handlePostPortfolio}
                                        disabled={isSubmitting}
                                        className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting
                                            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : <><Send size={16} /> Publicar en mi portafolio</>
                                        }
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSelectImage}
                                        className="flex-1 bg-slate-800 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg text-sm"
                                    >
                                        <Camera size={18} />
                                        Cámara
                                    </button>
                                    <button
                                        onClick={handleSelectImage}
                                        className="flex-1 bg-white text-slate-700 border border-slate-200 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm hover:bg-slate-50"
                                    >
                                        <ImageIcon size={18} />
                                        Galería
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Portfolio Feed */}
                    <div className="px-4 mb-2 flex items-center justify-between">
                        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <Grid3X3 size={16} className="text-emerald-500" />
                            Mi Portafolio
                        </h2>
                        <span className="text-xs text-slate-400 font-medium">{MY_PORTFOLIO.length} publicaciones</span>
                    </div>

                    <div className="px-4 pb-4 space-y-4">
                        {MY_PORTFOLIO.map((post) => (
                            <div key={post.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                {/* Post Header */}
                                <div className="p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-200">
                                            <img
                                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 leading-tight">Juan Pérez</p>
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                    <CalendarDays size={10} />
                                                    {formatDate(post.date)}
                                                </p>
                                                <span className="text-[10px]">{getCategoryEmoji(post.category)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-1.5 hover:bg-slate-50 rounded-full text-slate-400">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>

                                {/* Post Image */}
                                <div className="relative">
                                    <img
                                        src={post.image}
                                        alt={post.caption}
                                        className="w-full aspect-square object-cover"
                                    />
                                </div>

                                {/* Post Actions */}
                                <div className="p-3">
                                    <div className="flex items-center gap-4 mb-2">
                                        <button className="flex items-center gap-1.5 text-slate-600 hover:text-red-500 transition-colors">
                                            <Heart size={18} />
                                            <span className="text-xs font-bold">{post.likes}</span>
                                        </button>
                                        <button className="flex items-center gap-1.5 text-slate-600 hover:text-blue-500 transition-colors">
                                            <MessageCircle size={18} />
                                            <span className="text-xs font-bold">{post.comments}</span>
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed mb-2">
                                        {post.caption}
                                    </p>
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {post.tags.map(tag => (
                                                <span key={tag} className="text-[10px] text-emerald-600 font-medium">
                                                    #{tag.toLowerCase().replace(/\s+/g, '')}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <button className="w-full py-4 text-center text-sm text-emerald-600 font-bold bg-emerald-50 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                            <Plus size={16} />
                            Cargar más trabajos
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
