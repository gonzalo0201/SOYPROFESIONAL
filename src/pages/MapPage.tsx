import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import { useProfessionals } from '../hooks/useProfessionals';
import { getTradeIcon } from '../components/map/MapIcons';
import { StoriesRail } from '../components/map/StoriesRail';
import { StoryViewer } from '../components/map/StoryViewer';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { MapPin, ChevronRight, Rocket, Bell, Loader2, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocation } from '../contexts/LocationContext';
import L from 'leaflet';

// Blue pulsing marker for user location
const userLocationIcon = L.divIcon({
    html: `<div style="
        width: 18px; height: 18px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 6px rgba(59,130,246,0.25), 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    className: '',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

export function MapPage() {
    const { professionals, isLoading } = useProfessionals();
    const { position, cityName, fullLocationName, isLocating, permissionGranted } = useLocation();
    const [storyProfessionalId, setStoryProfessionalId] = useState<string | null>(null);

    const storyProfessional = storyProfessionalId ? professionals.find(p => p.id === storyProfessionalId) : null;
    const storyIndex = storyProfessionalId ? professionals.findIndex(p => p.id === storyProfessionalId) : -1;

    const mapCenter: [number, number] = [position.lat, position.lng];

    return (
        <div className="bg-slate-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 pb-8 rounded-b-[2rem] shadow-xl relative z-10 overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        {isLocating ? (
                            <span className="flex items-center gap-1.5">
                                <Loader2 size={12} className="animate-spin" />
                                Detectando ubicación...
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5">
                                {permissionGranted ? (
                                    <Navigation size={12} className="text-emerald-400" />
                                ) : (
                                    <MapPin size={14} />
                                )}
                                {fullLocationName || cityName}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                            <h1 className="text-2xl font-black tracking-tight">SOY<span className="text-emerald-400">PROFESIONAL</span></h1>
                        </div>
                        <Link to="/notifications" className="relative p-2 -mr-2 text-white/70 hover:text-white transition-colors">
                            <Bell size={22} />
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-black text-white border-2 border-slate-900">3</span>
                        </Link>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">Mostrá lo que sabés hacer. {cityName} te está buscando.</p>
                </div>

                {/* Decorative BG */}
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute -left-10 bottom-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            {/* Stories Rail */}
            <div className="-mt-6 relative z-20">
                <div className="bg-white mx-4 rounded-3xl shadow-lg border border-slate-100 overflow-hidden py-1">
                    <StoriesRail
                        professionals={professionals}
                        onSelectProfessional={(id) => setStoryProfessionalId(id)}
                    />
                </div>
            </div>

            <div className="p-4 space-y-6">

                {/* Map Preview Card */}
                <Link to="/map-full" className="block bg-white p-1 rounded-3xl shadow-sm border border-slate-100 transition-transform active:scale-[0.98]">
                    <div className="relative h-48 rounded-[1.2rem] overflow-hidden bg-slate-100">
                        <MapContainer
                            center={mapCenter}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                            zoomControl={false}
                            attributionControl={false}
                            dragging={false}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            />
                            {/* User location marker */}
                            {permissionGranted && (
                                <Marker position={mapCenter} icon={userLocationIcon} />
                            )}
                            {professionals.map((pro) => (
                                <Marker
                                    key={pro.id}
                                    position={[pro.lat, pro.lng]}
                                    icon={getTradeIcon(pro.trade, false)}
                                />
                            ))}
                        </MapContainer>

                        {/* Overlay Content */}
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 shadow-sm z-[400]">
                            {isLoading ? (
                                <span className="flex items-center gap-1.5">
                                    <Loader2 size={12} className="animate-spin" />
                                    Cargando...
                                </span>
                            ) : (
                                `${professionals.length} profesionales cerca`
                            )}
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]">
                            <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-lg flex flex-col items-center gap-1">
                                <MapPin size={24} className="text-emerald-500 fill-current" />
                                <div className="text-center">
                                    <p className="font-bold text-slate-900 leading-none">{cityName}</p>
                                    <p className="text-[10px] text-slate-500">
                                        {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Banner */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg group cursor-pointer">
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                                <Rocket size={14} />
                                Lanzamiento
                            </div>
                            <h2 className="text-xl font-bold mb-1">{cityName}</h2>
                            <p className="text-slate-400 text-sm max-w-[200px]">Sé de los primeros 100 profesionales y obtené tu badge de Early Adopter</p>
                        </div>
                        <div className="bg-white/10 p-3 rounded-full group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <ChevronRight size={24} />
                        </div>
                    </div>
                </div>

                {/* Featured Feed */}
                <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h2 className="font-bold text-slate-900 text-lg">Profesionales destacados</h2>
                        <Link to="/search" className="text-emerald-600 text-sm font-medium hover:text-emerald-700">Ver todos</Link>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center py-12 gap-3">
                            <Loader2 size={28} className="text-emerald-500 animate-spin" />
                            <p className="text-slate-400 text-sm">Cargando profesionales...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {professionals.filter(p => p.isBoosted).map(pro => (
                                <ProfessionalCard key={pro.id} professional={pro} />
                            ))}
                            {professionals.filter(p => !p.isBoosted).slice(0, 2).map(pro => (
                                <ProfessionalCard key={pro.id} professional={pro} />
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Story Viewer */}
            {storyProfessional && (
                <StoryViewer
                    professional={storyProfessional}
                    onClose={() => setStoryProfessionalId(null)}
                    onNext={() => {
                        const nextPro = professionals[storyIndex + 1];
                        if (nextPro) setStoryProfessionalId(nextPro.id);
                    }}
                    onPrev={() => {
                        const prevPro = professionals[storyIndex - 1];
                        if (prevPro) setStoryProfessionalId(prevPro.id);
                    }}
                    hasNext={storyIndex < professionals.length - 1}
                    hasPrev={storyIndex > 0}
                />
            )}
        </div>
    );
}
