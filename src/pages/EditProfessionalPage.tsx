import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, X, Instagram, Facebook, Smartphone, Loader2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { MAIN_CATEGORIES } from './HomePage';
import { useAuth } from '../contexts/AuthContext';
import { updateProfessionalProfile } from '../services/professionals';
import { uploadPortfolioImages, compressImage, deleteStorageFile } from '../services/storage';
import { PROFESSIONS_LIST, SERVICES_LIST, TRADES_LIST, TECNICS_LIST } from './PostPage';
import { supabase } from '../lib/supabase';

interface PortfolioItem {
    id: string;
    images: string[];
    category?: string;
}

export function EditProfessionalPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [professionalId, setProfessionalId] = useState<string | null>(null);

    // Form Stats
    const [category, setCategory] = useState<string>('');
    const [trade, setTrade] = useState<string>('');
    const [customTrade, setCustomTrade] = useState<string>('');
    const [description, setDescription] = useState('');
    const [skillsString, setSkillsString] = useState('');
    
    // Contact & Social
    const [whatsapp, setWhatsapp] = useState('');
    const [instagram, setInstagram] = useState('');
    const [facebook, setFacebook] = useState('');
    
    // Portfolio (Photos)
    const [existingPhotos, setExistingPhotos] = useState<PortfolioItem[]>([]);
    const [newPhotos, setNewPhotos] = useState<File[]>([]);
    const [photosToDelete, setPhotosToDelete] = useState<PortfolioItem[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    
    // Error
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadProfile() {
            if (!user) {
                navigate('/login');
                return;
            }
            
            try {
                // Find professional by profile_id
                const { data: pro, error: proError } = await supabase
                    .from('professionals')
                    .select('*')
                    .eq('profile_id', user.id)
                    .single();
                    
                if (proError || !pro) {
                    setError("No se encontró tu perfil profesional.");
                    setIsLoading(false);
                    return;
                }
                
                setProfessionalId(pro.id);
                setTrade(pro.trade);
                setDescription(pro.description || '');
                setSkillsString(pro.skills ? pro.skills.join(', ') : '');
                
                // Set initial category loosely based on trade presence (optional)
                if (PROFESSIONS_LIST.includes(pro.trade)) setCategory('profesional');
                else if (SERVICES_LIST.includes(pro.trade)) setCategory('servicio');
                else if (TRADES_LIST.includes(pro.trade)) setCategory('oficio');
                else if (TECNICS_LIST.includes(pro.trade)) setCategory('tecnico');
                else setCategory('');

                if (pro.social_links) {
                    const social = pro.social_links;
                    setWhatsapp(social.whatsapp || '');
                    setInstagram(social.instagram || '');
                    setFacebook(social.facebook || '');
                }

                // Get portfolio items
                const { data: portfolio } = await supabase
                    .from('portfolio_items')
                    .select('*')
                    .eq('professional_id', pro.id)
                    .order('created_at', { ascending: true });
                    
                if (portfolio) {
                    setExistingPhotos(portfolio);
                }

            } catch (err) {
                console.error(err);
                setError("Ocurrió un error cargando los datos.");
            } finally {
                setIsLoading(false);
            }
        }
        
        loadProfile();
    }, [user, navigate]);

    const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const currentTotalPhotos = existingPhotos.length - photosToDelete.length + newPhotos.length;
            const filesArray = Array.from(e.target.files);
            
            if (currentTotalPhotos + filesArray.length > 5) {
                alert('Puedes tener un máximo de 5 fotos en total.');
                const allowed = 5 - currentTotalPhotos;
                filesArray.splice(allowed);
            }
            
            const compressedFiles = await Promise.all(
                filesArray.map(file => compressImage(file))
            );
            
            setNewPhotos(prev => [...prev, ...compressedFiles]);
            
            const newPreviewUrls = compressedFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
        }
    };

    const handleRemoveExistingPhoto = (photo: PortfolioItem) => {
        setPhotosToDelete(prev => [...prev, photo]);
    };

    const handleRestoreExistingPhoto = (photo: PortfolioItem) => {
        setPhotosToDelete(prev => prev.filter(p => p.id !== photo.id));
    };

    const handleRemoveNewPhoto = (index: number) => {
        setNewPhotos(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(previewUrls[index]);
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!professionalId || !user) return;
        
        if (!trade && !customTrade) {
            alert('Por favor ingresa tu profesión o título.');
            return;
        }

        setIsSaving(true);
        setError(null);

        const currentTotalPhotos = existingPhotos.length - photosToDelete.length + newPhotos.length;
        if (currentTotalPhotos < 1) {
            alert('Debes tener al menos 1 foto en tu perfil.');
            setIsSaving(false);
            return;
        }

        try {
            const finalTrade = trade === 'other' ? customTrade : trade;
            
            // Delete removed photos
            for (const photo of photosToDelete) {
                if (!photo.images || photo.images.length === 0) continue;
                // Extract filename from URL 
                const urlParts = photo.images[0].split('/');
                const fileName = urlParts[urlParts.length - 1];
                if (fileName) {
                    await deleteStorageFile('portfolio', `${user.id}/${fileName}`);
                }
                await supabase.from('portfolio_items').delete().eq('id', photo.id);
            }
            
            // Upload new photos
            if (newPhotos.length > 0) {
                const uploadedResult = await uploadPortfolioImages(user.id, newPhotos);
                if (uploadedResult.errors && uploadedResult.errors.length > 0) {
                    throw new Error(`Error al subir imágenes: ${uploadedResult.errors.join(', ')}`);
                }
                
                if (uploadedResult.urls.length > 0) {
                    const itemsToInsert = uploadedResult.urls.map(url => ({
                        professional_id: professionalId,
                        images: [url],
                        caption: trade || 'Foto de portfolio',
                        category: 'general'
                    }));
                    const { error: insertError } = await supabase.from('portfolio_items').insert(itemsToInsert);
                    if (insertError) {
                        throw new Error(`Error al guardar en base de datos: ${insertError.message}`);
                    }
                }
            }

            // Clean skills
            const cleanSkills = skillsString
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0)
                .slice(0, 8);

            // Update profile info
            const updates = {
                trade: finalTrade,
                description,
                skills: cleanSkills,
                social_links: {
                    whatsapp,
                    instagram,
                    facebook
                }
            };

            await updateProfessionalProfile(professionalId, updates);
            
            navigate('/profile');
            
        } catch (err: any) {
            console.error('Error saving profile:', err);
            setError(err.message || 'Error al guardar los cambios.');
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 size={32} className="text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (error && !professionalId) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
                <p className="text-red-500 font-bold mb-4">{error}</p>
                <button onClick={() => navigate('/profile')} className="text-emerald-600 font-medium">
                    Volver al perfil
                </button>
            </div>
        );
    }

    const totalActivePhotosCount = existingPhotos.length - photosToDelete.length + newPhotos.length;

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="flex items-center justify-between p-4 px-6 md:px-8">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/profile')}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <ArrowLeft size={20} className="text-slate-600" />
                        </button>
                        <h1 className="text-xl font-bold text-slate-800">Mi Profesión</h1>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-md shadow-emerald-500/20 active:scale-95"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Guardar
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-6 max-w-2xl mx-auto mt-4">
                {/* Categoría y Título */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-5">
                    <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Información Principal</h2>
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Reasignar Categoría Inicial (Opcional)</label>
                        <div className="relative">
                            <select
                                value={category}
                                onChange={(e) => {
                                    setCategory(e.target.value);
                                    setTrade('');
                                    setCustomTrade('');
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none"
                            >
                                <option value="">Selecciona para ver la lista de despliegue...</option>
                                {MAIN_CATEGORIES.map(c => (
                                    <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ArrowLeft size={16} className="text-slate-400 -rotate-90" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Al cambiar la categoría inicial, se borrará tu título actual y deberás seleccionar uno nuevo de la lista de abajo para guardar los cambios.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Título / Profesión <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                value={trade}
                                onChange={(e) => {
                                    setTrade(e.target.value);
                                    if (e.target.value !== 'other') setCustomTrade('');
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none"
                            >
                                <option value="" disabled>Seleccionar título actual u otro...</option>
                                {trade && !PROFESSIONS_LIST.includes(trade) && !SERVICES_LIST.includes(trade) && !TRADES_LIST.includes(trade) && !TECNICS_LIST.includes(trade) && trade !== 'other' && (
                                    <option value={trade}>{trade} (Actual)</option>
                                )}
                                
                                {category === 'profesional' ? (
                                    <>
                                        {PROFESSIONS_LIST.map(prof => (
                                            <option key={prof} value={prof}>{prof}</option>
                                        ))}
                                    </>
                                ) : category === 'servicio' ? (
                                    <>
                                        {SERVICES_LIST.map(srv => (
                                            <option key={srv} value={srv}>{srv}</option>
                                        ))}
                                    </>
                                ) : category === 'oficio' ? (
                                    <>
                                        {TRADES_LIST.map(trd => (
                                            <option key={trd} value={trd}>{trd}</option>
                                        ))}
                                    </>
                                ) : category === 'tecnico' ? (
                                    <>
                                        {TECNICS_LIST.map(tec => (
                                            <option key={tec} value={tec}>{tec}</option>
                                        ))}
                                    </>
                                ) : null}
                                <option value="other">Otro (Escribir manualmente)</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ArrowLeft size={16} className="text-slate-400 -rotate-90" />
                            </div>
                        </div>
                        
                        {trade === 'other' && (
                            <input
                                type="text"
                                placeholder="Escribe tu título / profesión"
                                value={customTrade}
                                onChange={(e) => setCustomTrade(e.target.value)}
                                className="w-full mt-3 bg-white border border-emerald-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                                autoFocus
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Sobre tu servicio</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="Describe tu experiencia, cómo trabajas y por qué deberían elegirte..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Especialidades (Tags)</label>
                        <input
                            type="text"
                            value={skillsString}
                            onChange={(e) => setSkillsString(e.target.value)}
                            placeholder="Ej: A domicilio, Urgencias 24hs, Presupuesto sin cargo..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                        <p className="text-xs text-slate-400 mt-1">Separadas por comas. Máximo 8 etiquetas.</p>
                    </div>
                </div>

                {/* Redes Sociales y Contacto */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Contacto y Redes (Opcional)</h2>
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <Smartphone size={16} className="text-emerald-500" /> WhatsApp
                        </label>
                        <input
                            type="tel"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            placeholder="+54 9 11 1234-5678"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <Instagram size={16} className="text-pink-500" /> Usuario Instagram
                        </label>
                        <div className="flex">
                            <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-500 font-bold text-sm">
                                @
                            </span>
                            <input
                                type="text"
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
                                placeholder="tu_usuario_ig"
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-r-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <Facebook size={16} className="text-blue-600" /> Link Perfil Facebook
                        </label>
                        <input
                            type="url"
                            value={facebook}
                            onChange={(e) => setFacebook(e.target.value)}
                            placeholder="https://facebook.com/tu_pagina"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                    </div>
                </div>

                {/* Portfolio (Fotos) */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h2 className="text-lg font-bold text-slate-800">Fotos de tu Trabajo</h2>
                        <span className={clsx(
                            "text-sm font-bold bg-slate-100 px-2.5 py-0.5 rounded-full",
                            totalActivePhotosCount >= 5 ? "text-red-500" : "text-emerald-600"
                        )}>
                            {totalActivePhotosCount}/5 fotos
                        </span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                        {/* Render existing photos */}
                        {existingPhotos.map(photo => {
                            const isDeleted = photosToDelete.some(p => p.id === photo.id);
                            return (
                                <div key={photo.id} className={clsx("relative aspect-square rounded-2xl overflow-hidden border-2 transition-all", isDeleted ? "border-red-500 opacity-50 grayscale" : "border-slate-100")}>
                                    <img src={photo.images && photo.images[0] ? photo.images[0] : ''} alt="Portfolio item" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20 flex flex-col items-end justify-between p-2">
                                        {isDeleted ? (
                                            <button
                                                onClick={() => handleRestoreExistingPhoto(photo)}
                                                className="w-auto px-3 h-8 rounded-full bg-slate-900 font-bold text-xs text-white flex items-center justify-center hover:scale-105 transition-transform"
                                            >
                                                Descartar borrado
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRemoveExistingPhoto(photo)}
                                                className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Render new photos preview */}
                        {previewUrls.map((url, index) => (
                            <div key={url} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-emerald-500 ring-2 ring-emerald-50 ring-offset-2">
                                <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                                <button
                                    onClick={() => handleRemoveNewPhoto(index)}
                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/90 text-white flex items-center justify-center backdrop-blur-md hover:scale-105 transition-transform shadow-lg"
                                >
                                    <X size={16} />
                                </button>
                                <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-emerald-500 px-2 py-1 rounded-full uppercase tracking-wide shadow-md">
                                    NUEVO
                                </span>
                            </div>
                        ))}

                        {/* Add more button */}
                        {totalActivePhotosCount < 5 && (
                            <label className="aspect-square border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50/50 transition-all group">
                                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center mb-2 transition-colors">
                                    <Camera size={24} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <span className="text-sm font-semibold">Subir foto {totalActivePhotosCount + 1}</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handlePhotoSelect}
                                    disabled={totalActivePhotosCount >= 5}
                                />
                            </label>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Formatos: JPG, PNG, WEBP. Compresión automática para máximo rendimiento web.</p>
                </div>
            </div>
            {/* Safe Area spacing */}
            <div className="h-10"></div>
        </div>
    );
}
