/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';

interface LocationContextType {
  cityName: string;
  setCityName: (name: string) => void;
}

const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [cityName, setCityName] = useState(
    () => localStorage.getItem('sp_city_name') || 'Bahía Blanca'
  );

  const handleSetCity = (name: string) => {
    setCityName(name);
    localStorage.setItem('sp_city_name', name);
  };

  return (
    <LocationContext.Provider value={{ cityName, setCityName: handleSetCity }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within LocationProvider');
  return context;
}
