/**
 * Geocoding service using Nominatim (OpenStreetMap)
 * Free, no API key required
 */

interface NominatimReverseResult {
  address: {
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    suburb?: string;
    county?: string;
    state?: string;
    country?: string;
  };
  display_name: string;
}

interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface GeocodedCity {
  city: string;
  state: string;
  fullName: string;
}

interface GeocodedCoords {
  lat: number;
  lng: number;
  displayName: string;
}

// Cache to avoid repeated requests
const reverseCache = new Map<string, GeocodedCity>();
const CACHE_KEY = (lat: number, lng: number) => `${lat.toFixed(3)},${lng.toFixed(3)}`;

/**
 * Convert coordinates to city/locality name
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedCity> {
  const cacheKey = CACHE_KEY(lat, lng);
  
  // Check cache first
  const cached = reverseCache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`,
      {
        headers: {
          'User-Agent': 'SoyProfesional-App/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.status}`);
    }

    const data: NominatimReverseResult = await response.json();
    const addr = data.address;

    const city = addr.city || addr.town || addr.village || addr.hamlet || addr.suburb || 'Ubicación desconocida';
    const state = addr.state || addr.county || '';

    const result: GeocodedCity = {
      city,
      state,
      fullName: state ? `${city}, ${state}` : city,
    };

    // Cache the result
    reverseCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      city: 'Ubicación desconocida',
      state: '',
      fullName: 'Ubicación desconocida',
    };
  }
}

/**
 * Convert address text to coordinates (for "fixed" location mode)
 * Prioritizes Argentina results
 */
export async function forwardGeocode(address: string): Promise<GeocodedCoords | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&countrycodes=ar&limit=1&accept-language=es`,
      {
        headers: {
          'User-Agent': 'SoyProfesional-App/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim search error: ${response.status}`);
    }

    const data: NominatimSearchResult[] = await response.json();

    if (data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch (error) {
    console.error('Forward geocoding error:', error);
    return null;
  }
}

/**
 * Search for address suggestions (autocomplete)
 */
export async function searchAddresses(query: string): Promise<GeocodedCoords[]> {
  if (query.length < 3) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=ar&limit=5&accept-language=es`,
      {
        headers: {
          'User-Agent': 'SoyProfesional-App/1.0',
        },
      }
    );

    if (!response.ok) return [];

    const data: NominatimSearchResult[] = await response.json();

    return data.map((item) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name,
    }));
  } catch {
    return [];
  }
}

/**
 * Add random jitter to coordinates (for "approximate" mode, ~500m radius)
 */
export function addLocationJitter(lat: number, lng: number): { lat: number; lng: number } {
  // ~500m in degrees (rough approximation)
  const jitterLat = (Math.random() - 0.5) * 0.009; // ~0.5km
  const jitterLng = (Math.random() - 0.5) * 0.011; // ~0.5km (adjusted for lat)
  
  return {
    lat: lat + jitterLat,
    lng: lng + jitterLng,
  };
}
