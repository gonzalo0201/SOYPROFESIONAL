import { Camera, Image as ImageIcon, Send, Clock, Plus, Heart, MessageCircle, MoreHorizontal, Grid3X3, CalendarDays, X, Tag, Loader2, CheckCircle2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PORTFOLIO_CATEGORIES } from '../data/mockPortfolio';
import type { PortfolioCategory } from '../data/mockPortfolio';
import { useAuth } from '../contexts/AuthContext';
import { uploadPortfolioImages, uploadStoryMedia, compressImage } from '../services/storage';
import { addPortfolioItem, getPortfolioFor, type PortfolioDisplay } from '../services/portfolio';
import { supabase } from '../lib/supabase';
import clsx from 'clsx';

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

interface SelectedFile {
    file: File;
    preview: string;
}

export function PostPage() {
    const { user, profile } = useAuth();
    const [statusText, setStatusText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('historia');
    const [portfolioCaption, setPortfolioCaption] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<PortfolioCategory>('terminado');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Story state
    const [storyFile, setStoryFile] = useState<SelectedFile | null>(null);
    const [isPostingStory, setIsPostingStory] = useState(false);

    // Portfolio feed
    const [myPortfolio, setMyPortfolio] = useState<PortfolioDisplay[]>([]);
    const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);
    const [professionalId, setProfessionalId] = useState<string | null>(null);

    const portfolioFileRef = useRef<HTMLInputElement>(null);
    const storyFileRef = useRef<HTMLInputElement>(null);
    const storyCameraRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Find the user's professional profile
    useEffect(() => {
        if (!user) return;

        async function loadProfessionalId() {
            const { data } = await supabase
                .from('professionals')
                .select('id')
                .eq('profile_id', user!.id)
                .single();

            if (data) {
                setProfessionalId(data.id);
            }
        }

        loadProfessionalId();
    }, [user]);

    // Load portfolio for the user's professional profile
    useEffect(() => {
        if (!professionalId) {
            setIsLoadingPortfolio(false);
            return;
        }

        async function loadPortfolio() {
            setIsLoadingPortfolio(true);
            const items = await getPortfolioFor(professionalId!);
            setMyPortfolio(items);
            setIsLoadingPortfolio(false);
        }

        loadPortfolio();
    }, [professionalId]);

    // Handle portfolio file selection
    const handlePortfolioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles: SelectedFile[] = [];
        const maxFiles = 5 - selectedFiles.length;

        for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                newFiles.push({
                    file,
                    preview: URL.createObjectURL(file),
                });
            }
        }

        setSelectedFiles(prev => [...prev, ...newFiles]);

        // Reset input
        if (portfolioFileRef.current) {
            portfolioFileRef.current.value = '';
        }
    };

    // Handle story file selection
    const handleStoryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            // Revoke previous preview URL
            if (storyFile) {
                URL.revokeObjectURL(storyFile.preview);
            }
            setStoryFile({
                file,
                preview: URL.createObjectURL(file),
            });
        }

        // Reset inputs
        if (storyFileRef.current) storyFileRef.current.value = '';
        if (storyCameraRef.current) storyCameraRef.current.value = '';
    };

    const removeSelectedFile = (index: number) => {
        setSelectedFiles(prev => {
            const removed = prev[index];
            URL.revokeObjectURL(removed.preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handlePostStory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsPostingStory(true);
        setSubmitError(null);

        try {
            if (storyFile) {
                // Upload story media
                const compressed = storyFile.file.type.startsWith('image/')
                    ? await compressImage(storyFile.file, 1200, 0.85)
                    : storyFile.file;

                const { error } = await uploadStoryMedia(user.id, compressed);
                if (error) {
                    setSubmitError(error);
                    setIsPostingStory(false);
                    return;
                }
            }

            // TODO: Save story metadata to database when stories table exists
            setSubmitSuccess(true);
            setStoryFile(null);
            setStatusText('');
            setTimeout(() => {
                setSubmitSuccess(false);
                navigate('/');
            }, 1500);
        } catch (err) {
            console.error('Error posting story:', err);
            setSubmitError('Error al publicar la historia');
        } finally {
            setIsPostingStory(false);
        }
    };

    const handlePostPortfolio = async () => {
        if (selectedFiles.length === 0 || !user || !professionalId) return;

        setIsSubmitting(true);
        setSubmitError(null);
        setUploadProgress(0);

        try {
            // 1. Compress all images
            setUploadProgress(10);
            const compressedFiles: File[] = [];
            for (const sf of selectedFiles) {
                const compressed = await compressImage(sf.file, 1200, 0.85);
                compressedFiles.push(compressed);
            }

            // 2. Upload to Supabase Storage
            setUploadProgress(30);
            const { urls, errors } = await uploadPortfolioImages(user.id, compressedFiles);

            if (errors.length > 0) {
                console.warn('Some uploads failed:', errors);
            }

            if (urls.length === 0) {
                setSubmitError('No se pudo subir ninguna imagen');
                setIsSubmitting(false);
                return;
            }

            setUploadProgress(70);

            // 3. Save to portfolio_items table
            const { error } = await addPortfolioItem({
                professional_id: professionalId,
                images: urls,
                caption: portfolioCaption || 'Nuevo trabajo',
                description: portfolioCaption || '',
                category: selectedCategory,
                tags: tags,
            });

            setUploadProgress(100);

            if (error) {
                setSubmitError(error);
            } else {
                setSubmitSuccess(true);
                // Clean up previews
                selectedFiles.forEach(sf => URL.revokeObjectURL(sf.preview));
                setSelectedFiles([]);
                setPortfolioCaption('');
                setSelectedCategory('terminado');
                setTags([]);
                setTagInput('');

                // Refresh portfolio feed
                const items = await getPortfolioFor(professionalId);
                setMyPortfolio(items);

                setTimeout(() => setSubmitSuccess(false), 2000);
            }
        } catch (err) {
            console.error('Error posting portfolio:', err);
            setSubmitError('Error al publicar el trabajo');
        } finally {
            setIsSubmitting(false);
            setUploadProgress(0);
        }
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

    const userName = profile?.name || user?.user_metadata?.name || 'Profesional';
    const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=P&background=10b981&color=fff`;

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

            {/* Success toast */}
            {submitSuccess && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-sm animate-in fade-in slide-in-from-top-4">
                    <CheckCircle2 size={18} />
                    ¡Publicado exitosamente!
                </div>
            )}

            {/* Error toast */}
            {submitError && (
                <div className="mx-4 mt-4 bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-200 text-sm font-medium flex items-center justify-between">
                    <span>{submitError}</span>
                    <button onClick={() => setSubmitError(null)} className="text-red-400 hover:text-red-600">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* HISTORIA TAB */}
            {activeTab === 'historia' && (
                <div className="flex-1 flex flex-col p-4">

                    {/* Story Creator */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center">
                        {storyFile ? (
                            <div className="w-full space-y-3">
                                <div className="relative rounded-xl overflow-hidden">
                                    {storyFile.file.type.startsWith('video/') ? (
                                        <video
                                            src={storyFile.preview}
                                            className="w-full h-64 object-cover"
                                            controls
                                        />
                                    ) : (
                                        <img
                                            src={storyFile.preview}
                                            alt="Story preview"
                                            className="w-full h-64 object-cover"
                                        />
                                    )}
                                    <button
                                        onClick={() => {
                                            URL.revokeObjectURL(storyFile.preview);
                                            setStoryFile(null);
                                        }}
                                        className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="bg-slate-100 p-5 rounded-full mb-4">
                                    <Camera size={36} className="text-slate-400" />
                                </div>

                                <h2 className="text-lg font-bold text-slate-800 mb-1">Mostrá tu trabajo</h2>
                                <p className="text-slate-500 text-sm text-center max-w-xs mb-6">
                                    Compartí fotos y videos de tus trabajos para que potenciales clientes vean lo que hacés.
                                </p>
                            </>
                        )}

                        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full mb-5 border border-amber-100 font-medium">
                            <Clock size={12} />
                            La historia será visible por 24 horas en el mapa
                        </div>

                        <div className="flex gap-3 w-full max-w-sm">
                            <button
                                onClick={() => storyCameraRef.current?.click()}
                                className="flex-1 bg-slate-800 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-slate-200 text-sm"
                            >
                                <Camera size={18} />
                                Cámara
                            </button>
                            <button
                                onClick={() => storyFileRef.current?.click()}
                                className="flex-1 bg-white text-slate-700 border border-slate-200 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm hover:bg-slate-50"
                            >
                                <ImageIcon size={18} />
                                Galería
                            </button>
                            {/* Hidden file inputs */}
                            <input
                                ref={storyCameraRef}
                                type="file"
                                accept="image/*,video/mp4"
                                capture="environment"
                                onChange={handleStoryFileSelect}
                                className="hidden"
                            />
                            <input
                                ref={storyFileRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4"
                                onChange={handleStoryFileSelect}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Status Text */}
                    <div className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            {storyFile ? 'Agregá un texto a tu historia:' : 'O escribí qué estás haciendo ahora:'}
                        </label>
                        <form onSubmit={handlePostStory} className="flex gap-2">
                            <input
                                type="text"
                                value={statusText}
                                onChange={(e) => setStatusText(e.target.value)}
                                placeholder="Ej: Terminando instalación en Palermo..."
                                className="flex-1 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 text-sm transition-all placeholder:text-slate-400"
                                required={!storyFile}
                            />
                            <button
                                type="submit"
                                disabled={isPostingStory || (!statusText.trim() && !storyFile)}
                                className="bg-emerald-500 text-white p-3 rounded-xl disabled:opacity-50 active:scale-95 transition-transform hover:bg-emerald-600"
                            >
                                {isPostingStory
                                    ? <Loader2 size={20} className="animate-spin" />
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

                            {selectedFiles.length > 0 ? (
                                <div className="space-y-3">
                                    {/* Image previews */}
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {selectedFiles.map((sf, index) => (
                                            <div key={index} className="relative shrink-0">
                                                <img
                                                    src={sf.preview}
                                                    alt={`Selected ${index + 1}`}
                                                    className="w-32 h-32 object-cover rounded-xl"
                                                />
                                                <button
                                                    onClick={() => removeSelectedFile(index)}
                                                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full text-xs hover:bg-black/70"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        {selectedFiles.length < 5 && (
                                            <button
                                                onClick={() => portfolioFileRef.current?.click()}
                                                className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-300 transition-colors shrink-0"
                                            >
                                                <Plus size={24} />
                                                <span className="text-[10px] font-bold mt-1">{selectedFiles.length}/5</span>
                                            </button>
                                        )}
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

                                    {/* Upload progress bar */}
                                    {isSubmitting && uploadProgress > 0 && (
                                        <div className="space-y-1">
                                            <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-400 text-center font-medium">
                                                {uploadProgress < 30 ? 'Comprimiendo imágenes...' :
                                                    uploadProgress < 70 ? 'Subiendo a la nube...' :
                                                        'Guardando publicación...'}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handlePostPortfolio}
                                        disabled={isSubmitting}
                                        className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting
                                            ? <><Loader2 size={16} className="animate-spin" /> Publicando...</>
                                            : <><Send size={16} /> Publicar en mi portafolio</>
                                        }
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => portfolioFileRef.current?.click()}
                                        className="flex-1 bg-slate-800 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg text-sm"
                                    >
                                        <Camera size={18} />
                                        Cámara
                                    </button>
                                    <button
                                        onClick={() => portfolioFileRef.current?.click()}
                                        className="flex-1 bg-white text-slate-700 border border-slate-200 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm hover:bg-slate-50"
                                    >
                                        <ImageIcon size={18} />
                                        Galería
                                    </button>
                                </div>
                            )}

                            {/* Hidden file input for portfolio */}
                            <input
                                ref={portfolioFileRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={handlePortfolioFileSelect}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Portfolio Feed */}
                    <div className="px-4 mb-2 flex items-center justify-between">
                        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <Grid3X3 size={16} className="text-emerald-500" />
                            Mi Portafolio
                        </h2>
                        <span className="text-xs text-slate-400 font-medium">{myPortfolio.length} publicaciones</span>
                    </div>

                    <div className="px-4 pb-4 space-y-4">
                        {isLoadingPortfolio ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 size={24} className="text-emerald-500 animate-spin" />
                            </div>
                        ) : myPortfolio.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <Grid3X3 size={32} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm font-medium">Sin publicaciones aún</p>
                                <p className="text-xs mt-1">Subí tu primer trabajo para que los clientes lo vean</p>
                            </div>
                        ) : (
                            myPortfolio.map((post) => (
                                <div key={post.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    {/* Post Header */}
                                    <div className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-200">
                                                <img
                                                    src={userAvatar}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 leading-tight">{userName}</p>
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
                                            src={post.images[0]}
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
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
