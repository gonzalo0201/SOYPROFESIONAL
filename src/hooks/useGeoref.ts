import { useState, useEffect } from 'react';

export interface Localidad {
  id: string;
  nombre: string;
  provincia: {
    nombre: string;
  };
}

export function useGeoref(searchTerm: string) {
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 3) {
      setLocalidades([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`https://apis.datos.gob.ar/georef/api/localidades?nombre=${encodeURIComponent(searchTerm)}&max=10&campos=id,nombre,provincia.nombre`);
        if (res.ok) {
          const data = await res.json();
          setLocalidades(data.localidades || []);
        }
      } catch (err) {
        console.error('Error fetching localidades', err);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return { localidades, isLoading };
}
