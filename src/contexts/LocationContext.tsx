/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { reverseGeocode, addLocationJitter } from '../services/geocoding';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export type LocationMode = 'realtime' | 'approximate' | 'fixed';

interface Position {
  lat: number;
  lng: number;
}

interface LocationContextType {
  /** Current user position (may be jittered in approximate mode) */
  position: Position;
  /** Raw GPS position without jitter */
  rawPosition: Position;
  /** Detected city name */
  cityName: string;
  /** Full location string (city, state) */
  fullLocationName: string;
  /** Whether we're still detecting location */
  isLocating: boolean;
  /** Error message if location detection failed */
  error: string | null;
  /** Current location mode */
  locationMode: LocationMode;
  /** Whether location permission was granted */
  permissionGranted: boolean;
  /** Change the location mode */
  setLocationMode: (mode: LocationMode) => void;
  /** Request GPS permission and get location */
  requestLocation: () => void;
  /** Set a fixed location manually */
  setFixedLocation: (lat: number, lng: number, cityName?: string) => void;
  /** Update professional location in Supabase */
  syncProfessionalLocation: (lat: number, lng: number) => Promise<void>;
}

// Default: Bahía Blanca as fallback
const DEFAULT_POSITION: Position = { lat: -38.7183, lng: -62.2663 };

const LocationContext = createContext<LocationContextType | null>(null);

const STORAGE_KEY_MODE = 'sp_location_mode';
const STORAGE_KEY_FIXED = 'sp_fixed_location';
const STORAGE_KEY_CITY = 'sp_city_name';

export function LocationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [rawPosition, setRawPosition] = useState<Position>(DEFAULT_POSITION);
  const [position, setPosition] = useState<Position>(DEFAULT_POSITION);
  const [cityName, setCityName] = useState(() => localStorage.getItem(STORAGE_KEY_CITY) || 'Detectando...');
  const [fullLocationName, setFullLocationName] = useState('');
  const [isLocating, setIsLocating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [locationMode, setLocationModeState] = useState<LocationMode>(
    () => (localStorage.getItem(STORAGE_KEY_MODE) as LocationMode) || 'approximate'
  );
  const [watchId, setWatchId] = useState<number | null>(null);

  // Apply the position based on mode
  const applyPosition = useCallback((lat: number, lng: number, mode: LocationMode) => {
    setRawPosition({ lat, lng });

    if (mode === 'approximate') {
      const jittered = addLocationJitter(lat, lng);
      setPosition(jittered);
    } else {
      setPosition({ lat, lng });
    }
  }, []);

  // Geocode and update city name
  const updateCityName = useCallback(async (lat: number, lng: number) => {
    try {
      const result = await reverseGeocode(lat, lng);
      setCityName(result.city);
      setFullLocationName(result.fullName);
      localStorage.setItem(STORAGE_KEY_CITY, result.city);
    } catch {
      // Keep existing city name on error
    }
  }, []);

  // Sync professional location to Supabase
  const syncProfessionalLocation = useCallback(async (lat: number, lng: number) => {
    if (!user) return;

    try {
      const { data: pro } = await supabase
        .from('professionals')
        .select('id')
        .eq('profile_id', user.id)
        .single();

      if (pro) {
        await supabase
          .from('professionals')
          .update({ lat, lng })
          .eq('id', pro.id);
      }
    } catch (err) {
      console.error('Error syncing professional location:', err);
    }
  }, [user]);

  // Handle successful geolocation
  const handlePositionSuccess = useCallback((pos: GeolocationPosition) => {
    const { latitude, longitude } = pos.coords;

    setPermissionGranted(true);
    setIsLocating(false);
    setError(null);
    applyPosition(latitude, longitude, locationMode);
    updateCityName(latitude, longitude);
  }, [locationMode, applyPosition, updateCityName]);

  // Handle geolocation error
  const handlePositionError = useCallback((err: GeolocationPositionError) => {
    setIsLocating(false);

    switch (err.code) {
      case err.PERMISSION_DENIED:
        setError('Permiso de ubicación denegado');
        setPermissionGranted(false);
        break;
      case err.POSITION_UNAVAILABLE:
        setError('Ubicación no disponible');
        break;
      case err.TIMEOUT:
        setError('Tiempo de espera agotado');
        break;
    }

    // Try to load fixed location from storage
    const savedFixed = localStorage.getItem(STORAGE_KEY_FIXED);
    if (savedFixed) {
      try {
        const { lat, lng } = JSON.parse(savedFixed);
        applyPosition(lat, lng, locationMode);
        updateCityName(lat, lng);
      } catch {
        // Use default
      }
    }
  }, [locationMode, applyPosition, updateCityName]);

  // Request location from the browser
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      setIsLocating(false);
      return;
    }

    setIsLocating(true);
    setError(null);

    // Clear previous watch if any
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // Accept cached position up to 1 min old
    };

    if (locationMode === 'realtime') {
      // Continuous tracking
      const id = navigator.geolocation.watchPosition(
        handlePositionSuccess,
        handlePositionError,
        options
      );
      setWatchId(id);
    } else {
      // One-shot
      navigator.geolocation.getCurrentPosition(
        handlePositionSuccess,
        handlePositionError,
        options
      );
    }
  }, [locationMode, watchId, handlePositionSuccess, handlePositionError]);

  // Set location mode and persist
  const setLocationMode = useCallback((mode: LocationMode) => {
    setLocationModeState(mode);
    localStorage.setItem(STORAGE_KEY_MODE, mode);

    // Re-apply position with new mode
    applyPosition(rawPosition.lat, rawPosition.lng, mode);

    // If switching to realtime, start watching
    if (mode === 'realtime') {
      requestLocation();
    } else if (watchId !== null) {
      // Stop watching if not realtime
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [rawPosition, applyPosition, requestLocation, watchId]);

  // Set fixed location manually
  const setFixedLocation = useCallback((lat: number, lng: number, city?: string) => {
    localStorage.setItem(STORAGE_KEY_FIXED, JSON.stringify({ lat, lng }));
    setRawPosition({ lat, lng });
    setPosition({ lat, lng });
    setIsLocating(false);
    setError(null);

    if (city) {
      setCityName(city);
      localStorage.setItem(STORAGE_KEY_CITY, city);
    } else {
      updateCityName(lat, lng);
    }
  }, [updateCityName]);

  // Initial location request on mount
  useEffect(() => {
    // Check if there's a fixed location saved
    const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as LocationMode | null;

    if (savedMode === 'fixed') {
      const savedFixed = localStorage.getItem(STORAGE_KEY_FIXED);
      if (savedFixed) {
        try {
          const { lat, lng } = JSON.parse(savedFixed);
          setRawPosition({ lat, lng });
          setPosition({ lat, lng });
          setIsLocating(false);
          updateCityName(lat, lng);
          return;
        } catch {
          // Fall through to GPS
        }
      }
    }

    // Request GPS location
    requestLocation();

    // Cleanup watch on unmount
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LocationContext.Provider
      value={{
        position,
        rawPosition,
        cityName,
        fullLocationName,
        isLocating,
        error,
        locationMode,
        permissionGranted,
        setLocationMode,
        requestLocation,
        setFixedLocation,
        syncProfessionalLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within LocationProvider');
  return context;
}
