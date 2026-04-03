import { Search, MapPin, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// Mock database of cities
export const CITIES = [
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

interface CitySearchProps {
    onSelectLocation: (lat: number, lng: number) => void;
}

export function CitySearch({ onSelectLocation }: CitySearchProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<typeof CITIES>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter suggestions logic
    useEffect(() => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        const filtered = CITIES.filter(city =>
            city.name.toLowerCase().includes(query.toLowerCase())
        );
        setSuggestions(filtered);
    }, [query]);

    // Handle outside click to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (city: typeof CITIES[0]) => {
        setQuery(city.name);
        setIsOpen(false);
        onSelectLocation(city.lat, city.lng);
    };

    const handleClear = () => {
        setQuery('');
        setSuggestions([]);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-sm pointer-events-auto">
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
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder="Buscar ciudad o localidad..."
                    className="w-full bg-white pl-10 pr-10 py-3 rounded-full shadow-lg border-none outline-none ring-2 ring-transparent focus:ring-emerald-500/20 text-slate-800 placeholder:text-slate-400 transition-all font-medium"
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

            {/* Suggestions Dropdown */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute top-14 left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 py-1 z-50">
                    {suggestions.map((city) => (
                        <button
                            key={city.name}
                            onClick={() => handleSelect(city)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-none"
                        >
                            <div className="bg-slate-100 p-2 rounded-full text-slate-500">
                                <MapPin size={16} />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 text-sm">{city.name.split(',')[0]}</p>
                                <p className="text-xs text-slate-500">{city.name.split(',')[1]}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* No results state */}
            {isOpen && query.length >= 2 && suggestions.length === 0 && (
                <div className="absolute top-14 left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 text-center z-50">
                    <p className="text-sm text-slate-500">No encontramos esa localidad.</p>
                </div>
            )}
        </div>
    );
}
