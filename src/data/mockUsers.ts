export type Trade = 'Gasista' | 'Plomero' | 'Electricista' | 'Albañil' | 'Carpintero';

export interface Professional {
    id: number;
    name: string;
    trade: Trade;
    rating: number;
    reviews: number;
    lat: number;
    lng: number;
    image: string;
    isVerified: boolean;
    isEarlyAdopter?: boolean;
    isBoosted?: boolean;
    status: string;
    description: string;
    skills: string[];
}

export const MOCK_PROFESSIONALS: Professional[] = [
    {
        id: 1,
        name: "Carlos Mendoza",
        trade: "Gasista",
        rating: 4.8,
        reviews: 127,
        lat: -34.6037,
        lng: -58.3816,
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
        isVerified: true,
        isEarlyAdopter: true,
        isBoosted: true, // Boosted profile
        status: "Instalando estufas en Palermo",
        description: "Instalación, mantenimiento y reparación de equipos de gas. Más de 10 años de experiencia en Bahía Blanca. Matriculado 1ra categoría.",
        skills: ["Instalación", "Mantenimiento", "Caloramas", "Termotanques"]
    },
    {
        id: 2,
        name: "Ana Rodríguez",
        trade: "Electricista",
        rating: 4.9,
        reviews: 89,
        lat: -34.6087,
        lng: -58.3716,
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
        isVerified: true,
        isEarlyAdopter: true,
        status: "Disponible para urgencias",
        description: "Instalaciones eléctricas domiciliarias e industriales. Tableros, puesta a tierra, iluminación LED y recableado completo.",
        skills: ["Domiciliario", "Industrial", "Tableros", "LED"]
    },
    {
        id: 3,
        name: "Diego López",
        trade: "Plomero",
        rating: 4.6,
        reviews: 64,
        lat: -34.5987,
        lng: -58.3916,
        image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop",
        isVerified: true,
        status: "En obra - Recoleta",
        description: "Reparaciones de cañerías, destapaciones, instalación de termotanques y calefones. Servicio urgente 24hs.",
        skills: ["Plomería", "Gas", "Urgencias", "Termotanques"]
    },
    {
        id: 4,
        name: "Miguel Ángel",
        trade: "Albañil",
        rating: 4.5,
        reviews: 42,
        lat: -34.6137,
        lng: -58.3856,
        image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
        isVerified: false,
        status: "Terminando revoque",
        description: "Albañilería general, revoques, contrapisos, carpetas y colocación de cerámicos. Presupuestos sin cargo.",
        skills: ["Albañilería", "Revoques", "Pisos", "Losa"]
    },
    {
        id: 5,
        name: "Roberto Díaz",
        trade: "Carpintero",
        rating: 4.9,
        reviews: 15,
        lat: -34.5937,
        lng: -58.3756,
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
        isVerified: true,
        status: "En el taller",
        description: "Muebles a medida, placares, bajo mesadas y restauraciones de madera maciza. Trabajos garantizados.",
        skills: ["Muebles", "Restauración", "Madera", "Laqueado"]
    }
];
