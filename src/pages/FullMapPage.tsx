import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PROFESSIONALS } from '../data/mockUsers';
import { getProfileMarkerIcon } from '../components/map/MapIcons';
import { MapSearch } from '../components/map/MapSearch';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { ArrowLeft, Users } from 'lucide-react';
import type { Professional } from '../data/mockUsers';

// Profile bottom sheet style container
function ProfileBottomSheet({ professional, onClose }: { professional: Professional, onClose: () => void }) {
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
    const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    // Filter professionals based on active filter
    const filteredProfessionals = activeFilter
        ? MOCK_PROFESSIONALS.filter(p =>
            p.trade.toLowerCase().includes(activeFilter.toLowerCase()) ||
            p.name.toLowerCase().includes(activeFilter.toLowerCase()) ||
            p.skills.some(s => s.toLowerCase().includes(activeFilter.toLowerCase()))
        )
        : MOCK_PROFESSIONALS;

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

            <MapContainer
                center={[-34.6037, -58.3816]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                <MapController center={mapCenter} />

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
