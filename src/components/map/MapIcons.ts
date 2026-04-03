import L from 'leaflet';
import type { Trade } from '../../data/mockUsers';

// Helper to get color class (we won't use this directly in HTML string but good to have)
const getTradeColor = (trade: Trade) => {
  switch (trade) {
    case 'Gasista': return '#f97316'; // orange-500
    case 'Plomero': return '#3b82f6'; // blue-500
    case 'Electricista': return '#eab308'; // yellow-500
    case 'Albañil': return '#78716c'; // stone-500
    case 'Carpintero': return '#b45309'; // amber-700
    default: return '#10b981'; // primary
  }
};

export const getTradeIcon = (trade: Trade, isSelected: boolean) => {
  const color = getTradeColor(trade);
  const size = isSelected ? 40 : 32;
  const border = isSelected ? '4px solid rgba(255,255,255,0.8)' : '2px solid white';

  // Create a simple HTML string for the icon
  // Note: Tailwind classes might not parse fully inside Leaflet's HTML if not careful, 
  // so using inline styles for critical parts is safer for the divIcon.
  const html = `
    <div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: ${border};
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-family: sans-serif;
      font-size: 10px;
      position: relative;
      transition: all 0.2s ease;
    ">
      ${trade[0].toUpperCase()}
      <div style="
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 0; 
        height: 0; 
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid white;
      "></div>
    </div>
  `;

  return L.divIcon({
    className: '', // Empty to avoid default styles interfering
    html: html,
    iconSize: [size, size + 10], // Account for the pointer
    iconAnchor: [size / 2, size + 10],
    popupAnchor: [0, -size]
  });
};

// Custom "Story-style" marker icon
export const getProfileMarkerIcon = (image: string, isBoosted: boolean, trade: string) => {
  // Determine ring color/style based on boost status
  const ringClass = isBoosted
    ? "bg-gradient-to-tr from-amber-300 to-orange-500"
    : "bg-gradient-to-tr from-emerald-300 to-emerald-500";

  // Flame icon for boosted users
  const flameIcon = isBoosted
    ? `<div class="absolute -bottom-1 -right-1 bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
             <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flame"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.246-3.636-2.95-6.577 0-.065.053-.105.111-.071 1.07.638 1.95 2.223 2.182 2.84.144.385.45.615.827.615h.063c.441 0 .783-.418.665-.845-.373-1.352-1.39-4.11-2.618-5.748C8.163.093 8.358 0 8.57 0c2.739 0 5.4 3.793 5.372 8.326 0 2.227-1.01 4.15-2.091 5.367a3.86 3.86 0 0 1-1.427 1.077"/></svg>
           </div>`
    : '';

  return L.divIcon({
    className: 'custom-profile-marker',
    html: `
            <div class="relative w-14 h-14 group transition-transform hover:scale-110 hover:z-50 cursor-pointer">
                <div class="${ringClass} p-[3px] rounded-full shadow-md w-full h-full">
                    <img src="${image}" class="w-full h-full rounded-full border-2 border-white object-cover" />
                </div>
                ${flameIcon}
                <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span class="text-[10px] font-bold text-slate-800">${trade}</span>
                </div>
            </div>
        `,
    iconSize: [56, 56], // Width, Height
    iconAnchor: [28, 28], // Center
    popupAnchor: [0, -28]
  });
};
