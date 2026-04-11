import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfessionals, type ProfessionalDisplay } from '../hooks/useProfessionals';
import { getProfileMarkerIcon } from '../components/map/MapIcons';
import { MapSearch } from '../components/map/MapSearch';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { ArrowLeft, Users, Crosshair } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';
import L from 'leaflet';

// Blue marker for user location
const userLocationIcon = L.divIcon({
    html: `<div style="
        width: 20px; height: 20px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 8px rgba(59,130,246,0.2), 0 2px 8px rgba(0,0,0,0.3);
        animation: pulse-ring 2s ease-out infinite;
    "></div>
    <style>
        @keyframes pulse-ring {
            0% { box-shadow: 0 0 0 4px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.3); }
            50% { box-shadow: 0 0 0 12px rgba(59,130,246,0.1), 0 2px 8px rgba(0,0,0,0.3); }
            100% { box-shadow: 0 0 0 4px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.3); }
        }
    </style>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

// Profile bottom sheet style container
function ProfileBottomSheet({ professional, onClose }: { professional: ProfessionalDisplay, onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[1000] flex justify-center items-end pointer-events-none">
            <div className="absolute inset-0 bg-black/20 pointer-events-auto" onClick={onClose} />
            <div className="bg-white w-full max-w-md p-4 rounded-t-3xl shadow-2xl relative z-10 pointer-events-auto animate-in slide-in-from-bottom-5">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
                <ProfessionalCard professional={professional} />
            </div>
        </div>
    );
}

// Internal component to control map view
function MapController({ center }: { center: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 13, {
                animate: true,
                duration: 1.5
            });
        }
    }, [center, map]);
    return null;
}

export function FullMapPage() {
    const navigate = useNavigate();
    const { professionals } = useProfessionals();
    const { position, permissionGranted, requestLocation } = useLocation();
    const [selectedPro, setSelectedPro] = useState<ProfessionalDisplay | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const userCenter: [number, number] = [position.lat, position.lng];

    // Filter professionals based on active filter
    const filteredProfessionals = activeFilter
        ? professionals.filter(p =>
            p.trade.toLowerCase().includes(activeFilter.toLowerCase()) ||
            p.name.toLowerCase().includes(activeFilter.toLowerCase()) ||
            p.skills.some(s => s.toLowerCase().includes(activeFilter.toLowerCase()))
        )
        : professionals;

    const handleRecenter = () => {
        if (permissionGranted) {
            setMapCenter([...userCenter]);
        } else {
            requestLocation();
        }
    };

    return (
        <div className="relative h-screen w-full bg-slate-100">
            {/* Header Controls */}
            <div className="absolute top-4 left-4 right-4 z-[400] flex gap-3 items-start pointer-events-none">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-white p-3 rounded-2xl shadow-lg text-slate-700 hover:bg-slate-50 border border-slate-100 shrink-0 pointer-events-auto"
                >
                    <ArrowLeft size={22} />
                </button>

                <div className="flex-1">
                    <MapSearch
                        professionals={professionals}
                        onSelectLocation={(lat, lng) => setMapCenter([lat, lng])}
                        onSelectProfessional={(pro) => setSelectedPro(pro)}
                        onFilterApplied={(_type, value) => setActiveFilter(value)}
                    />
                </div>
            </div>

            {/* Active filter badge */}
            {activeFilter && (
                <div className="absolute top-[4.5rem] left-[4.5rem] right-4 z-[400] pointer-events-auto">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        <span className="truncate max-w-[200px]">{activeFilter}</span>
                        <button
                            onClick={() => setActiveFilter(null)}
                            className="hover:bg-emerald-400 rounded-full p-0.5 transition-colors"
                        >
                            <span className="sr-only">Quitar filtro</span>
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* My Location Button */}
            <button
                onClick={handleRecenter}
                className="absolute bottom-24 right-4 z-[400] bg-white p-3.5 rounded-2xl shadow-lg border border-slate-200 text-blue-500 hover:bg-blue-50 active:scale-95 transition-all"
                title="Mi ubicación"
            >
                <Crosshair size={22} />
            </button>

            <MapContainer
                center={userCenter}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                <MapController center={mapCenter} />

                {/* User location marker */}
                {permissionGranted && (
                    <Marker position={userCenter} icon={userLocationIcon} />
                )}

                {filteredProfessionals.map((pro) => (
                    <Marker
                        key={pro.id}
                        position={[pro.lat, pro.lng]}
                        icon={getProfileMarkerIcon(pro.image, !!pro.isBoosted, pro.trade)}
                        eventHandlers={{
                            click: () => setSelectedPro(pro),
                        }}
                    >
                    </Marker>
                ))}
            </MapContainer>

            {/* Floating counter chip */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-xl border border-slate-200/50 flex items-center gap-2">
                    <div className="bg-emerald-500 p-1 rounded-full">
                        <Users size={12} className="text-white" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                        {filteredProfessionals.length}
                    </span>
                    <span className="text-xs text-slate-500">
                        {filteredProfessionals.length === 1 ? 'profesional' : 'profesionales'} en esta zona
                    </span>
                </div>
            </div>

            {/* Selected Profile Sheet */}
            {selectedPro && (
                <ProfileBottomSheet
                    professional={selectedPro}
                    onClose={() => setSelectedPro(null)}
                />
            )}
        </div>
    );
}
