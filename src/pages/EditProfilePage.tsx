import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadAvatar, compressImage } from '../services/storage';
import clsx from 'clsx';

export function EditProfilePage() {
    const navigate = useNavigate();
    const { user, profile, isLoading: authLoading, updateProfile } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [photo, setPhoto] = useState('');
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [age, setAge] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');

    // Upload states
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Initialize form with real data
    useEffect(() => {
        if (profile) {
            const fullName = profile.name || '';
            const parts = fullName.split(' ');
            setName(parts[0] || '');
            setLastName(parts.slice(1).join(' ') || '');
            setEmail(profile.email || '');
            setPhoto(profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=10b981&color=fff&bold=true`);
            if (profile.age) setAge(String(profile.age));
            if (profile.address) setAddress(profile.address);
        } else if (user) {
            const fullName = user.user_metadata?.name || '';
            const parts = fullName.split(' ');
            setName(parts[0] || '');
            setLastName(parts.slice(1).join(' ') || '');
            setEmail(user.email || '');
            setPhoto(user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=10b981&color=fff&bold=true`);
        }
    }, [profile, user]);

    // Handle avatar file selection
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        if (!file.type.startsWith('image/')) {
            setUploadError('Solo se permiten imágenes');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setUploadError('La imagen no puede superar los 5MB');
            return;
        }

        setUploadError(null);
        setIsUploadingAvatar(true);

        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);

        try {
            const compressed = await compressImage(file, 512, 0.7);
            const uploadPromise = uploadAvatar(user.id, compressed);
            const timeoutPromise = new Promise<{ url: null; error: string }>((resolve) =>
                setTimeout(() => resolve({ url: null, error: 'La subida tardó demasiado. Verificá tu conexión.' }), 30000)
            );

            const { url, error } = await Promise.race([uploadPromise, timeoutPromise]);

            if (error) {
                setUploadError(error);
            } else if (url) {
                setPhoto(url + '?t=' + Date.now());
                setAvatarPreview(null);
            }
        } catch (err) {
            console.error('Error uploading avatar:', err);
            setUploadError('Error al subir la imagen. Intentá de nuevo.');
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        setSaveSuccess(false);
        setUploadError(null);

        try {
            const fullName = `${name} ${lastName}`.trim();

            const { error } = await updateProfile({
                name: fullName,
                email: email,
                age: age ? parseInt(age, 10) : null,
                address: address || null,
            });

            if (error) {
                setUploadError(error);
            } else {
                setSaveSuccess(true);
                setTimeout(() => {
                    navigate(-1);
                }, 800);
            }
        } catch (err) {
            console.error('[EditProfile] Save error:', err);
            setUploadError('Error al guardar. Intentá de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [authLoading, user, navigate]);

    if (authLoading) {
        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-emerald-500 animate-spin" />
                    <p className="text-slate-400 text-sm">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    const displayPhoto = avatarPreview || photo;

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
                    disabled={isSaving}
                    className={clsx(
                        "px-5 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                        saveSuccess
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
                    )}
                >
                    {isSaving ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : saveSuccess ? (
                        <CheckCircle2 size={16} />
                    ) : null}
                    {saveSuccess ? 'Guardado!' : 'Guardar'}
                </button>
            </div>

            <div className="p-4 space-y-6">

                {/* Photo Section */}
                <div className="flex flex-col items-center py-4">
                    <div className="relative group">
                        <div className={clsx(
                            "w-28 h-28 rounded-full overflow-hidden border-4 shadow-lg transition-all",
                            isUploadingAvatar ? "border-emerald-300 animate-pulse" : "border-white"
                        )}>
                            <img src={displayPhoto} alt="Profile" className="w-full h-full object-cover" />
                            {isUploadingAvatar && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                                    <Loader2 size={28} className="text-white animate-spin" />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingAvatar}
                            className="absolute bottom-0 right-0 bg-emerald-500 text-white p-2.5 rounded-full shadow-lg border-2 border-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                            <Camera size={16} />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-3">
                        {isUploadingAvatar ? 'Subiendo foto...' : 'Toca para cambiar tu foto'}
                    </p>
                    {uploadError && (
                        <p className="text-xs text-red-500 mt-1 font-medium">{uploadError}</p>
                    )}
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

                    <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Teléfono / WhatsApp</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Ej: +54 9 299 412-3456"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all placeholder:text-slate-400"
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

                {/* Tip */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                    <p className="text-sm text-emerald-700 font-medium">
                        ¿Querés ofrecer tus servicios? Usá la pestaña <strong>"Publicar"</strong> para crear tu anuncio profesional.
                    </p>
                </div>
            </div>
        </div>
    );
}
