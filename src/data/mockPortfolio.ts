export type PortfolioCategory = 'antes-despues' | 'en-progreso' | 'terminado' | 'general';

export interface PortfolioItem {
    id: number;
    professionalId: number;
    images: string[];           // Array of image URLs (2 for antes-despues: [antes, despues])
    caption: string;
    description: string;
    date: string;
    category: PortfolioCategory;
    tags: string[];
    likes: number;
    comments: number;
    location?: string;
}

export const PORTFOLIO_CATEGORIES: { id: PortfolioCategory; label: string; emoji: string }[] = [
    { id: 'terminado', label: 'Terminado', emoji: '✅' },
    { id: 'antes-despues', label: 'Antes / Después', emoji: '🔄' },
    { id: 'en-progreso', label: 'En progreso', emoji: '🔨' },
    { id: 'general', label: 'General', emoji: '📸' },
];

export const MOCK_PORTFOLIO: PortfolioItem[] = [
    // ===== Carlos Mendoza (id: 1) - Gasista =====
    {
        id: 1,
        professionalId: 1,
        images: [
            'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=600&fit=crop',
        ],
        caption: 'Remodelación completa de baño',
        description: 'Cambio total de cañerías de gas y agua en un baño de 15 años. Se reemplazó el termotanque por un calefón de última generación. El cliente quedó muy satisfecho con el resultado.',
        date: '2026-03-15',
        category: 'antes-despues',
        tags: ['Plomería', 'Remodelación', 'Termotanque'],
        likes: 87,
        comments: 12,
        location: 'Bahía Blanca Centro',
    },
    {
        id: 2,
        professionalId: 1,
        images: [
            'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=600&fit=crop',
        ],
        caption: 'Instalación de calefón de última generación',
        description: 'Calefón tiro balanceado marca Orbis instalado con todas las normas de seguridad. Incluye conexión de gas, agua fría y caliente, y verificación de tiraje.',
        date: '2026-03-08',
        category: 'terminado',
        tags: ['Instalación', 'Calefón', 'Gas'],
        likes: 54,
        comments: 8,
        location: 'Villa Mitre',
    },
    {
        id: 3,
        professionalId: 1,
        images: [
            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=600&fit=crop',
        ],
        caption: 'Reparación de estufa a gas',
        description: 'Servicio de mantenimiento y reparación de estufa que no encendía correctamente. Se cambió el termopar y se limpió el piloto.',
        date: '2026-02-22',
        category: 'terminado',
        tags: ['Reparación', 'Estufa', 'Mantenimiento'],
        likes: 31,
        comments: 4,
        location: 'Barrio Universitario',
    },
    {
        id: 4,
        professionalId: 1,
        images: [
            'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop',
        ],
        caption: 'Mantenimiento preventivo de caldera',
        description: 'Servicio anual de mantenimiento de caldera mural. Limpieza de quemadores, verificación de presión, y control de seguridades.',
        date: '2026-02-10',
        category: 'general',
        tags: ['Mantenimiento', 'Caldera', 'Preventivo'],
        likes: 22,
        comments: 3,
        location: 'Bahía Blanca',
    },
    {
        id: 5,
        professionalId: 1,
        images: [
            'https://images.unsplash.com/photo-1574359411659-15573a27fd0c?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1631545806609-2e4b5b963a31?w=600&h=600&fit=crop',
        ],
        caption: 'Instalación de split con conexión de gas',
        description: 'Instalación completa de aire acondicionado split con extensión de cañería de cobre y conexión eléctrica dedicada.',
        date: '2026-01-25',
        category: 'antes-despues',
        tags: ['Instalación', 'Aire', 'Split'],
        likes: 65,
        comments: 9,
        location: 'Ing. White',
    },
    {
        id: 6,
        professionalId: 1,
        images: [
            'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=600&fit=crop',
        ],
        caption: 'Cambio de termotanque eléctrico a gas',
        description: 'Reemplazo de un termotanque eléctrico de 50L por uno a gas de 80L. Más eficiente y económico para una familia de 4 personas.',
        date: '2026-01-15',
        category: 'terminado',
        tags: ['Termotanque', 'Cambio', 'Gas'],
        likes: 43,
        comments: 6,
        location: 'Punta Alta',
    },
    {
        id: 7,
        professionalId: 1,
        images: [
            'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=600&fit=crop',
        ],
        caption: 'Obra en progreso - Cañería de gas nueva',
        description: 'Instalación de cañería de gas desde medidor hasta cocina y calefón en construcción nueva. En proceso de certificación.',
        date: '2026-03-20',
        category: 'en-progreso',
        tags: ['Cañería', 'Obra nueva', 'Gas'],
        likes: 19,
        comments: 2,
        location: 'Aldea Romana',
    },

    // ===== Ana Rodríguez (id: 2) - Electricista =====
    {
        id: 8,
        professionalId: 2,
        images: [
            'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1621905252072-958e528fa924?w=600&h=600&fit=crop',
        ],
        caption: 'Tablero eléctrico completamente renovado',
        description: 'Reemplazo total del tablero eléctrico antiguo con térmicas y disyuntor diferencial. Ahora cumple con todas las normas vigentes.',
        date: '2026-03-10',
        category: 'antes-despues',
        tags: ['Tablero', 'Seguridad', 'Normas'],
        likes: 72,
        comments: 11,
        location: 'Villa Mitre',
    },
    {
        id: 9,
        professionalId: 2,
        images: [
            'https://images.unsplash.com/photo-1558618047-f4b511b566ef?w=600&h=600&fit=crop',
        ],
        caption: 'Iluminación LED en local comercial',
        description: 'Instalación de sistema de iluminación LED completo en local de 120m². Bajó el consumo eléctrico un 60%.',
        date: '2026-02-28',
        category: 'terminado',
        tags: ['LED', 'Comercial', 'Iluminación'],
        likes: 48,
        comments: 7,
        location: 'Centro',
    },
    {
        id: 10,
        professionalId: 2,
        images: [
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=600&fit=crop',
        ],
        caption: 'Recableado completo de departamento',
        description: 'Recableado integral de un departamento de 3 ambientes. Cables nuevos, tomacorrientes dobles y puesta a tierra certificada.',
        date: '2026-02-15',
        category: 'terminado',
        tags: ['Recableado', 'Departamento', 'Puesta a tierra'],
        likes: 39,
        comments: 5,
        location: 'Bahía Blanca',
    },
    {
        id: 11,
        professionalId: 2,
        images: [
            'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&h=600&fit=crop',
        ],
        caption: 'Instalación eléctrica en obra nueva',
        description: 'Tendido eléctrico completo en vivienda unifamiliar. 28 bocas, tablero principal y secundario, punto para termotanque eléctrico.',
        date: '2026-03-18',
        category: 'en-progreso',
        tags: ['Obra nueva', 'Tendido', 'Vivienda'],
        likes: 28,
        comments: 3,
        location: 'Patagonia',
    },

    // ===== Diego López (id: 3) - Plomero =====
    {
        id: 12,
        professionalId: 3,
        images: [
            'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=600&fit=crop',
        ],
        caption: 'Renovación total de baño',
        description: 'Cambio completo de cañerías, grifería, inodoro y ducha. Trabajo de 5 días con resultado impecable.',
        date: '2026-03-05',
        category: 'antes-despues',
        tags: ['Baño', 'Renovación', 'Grifería'],
        likes: 93,
        comments: 15,
        location: 'Centro',
    },
    {
        id: 13,
        professionalId: 3,
        images: [
            'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=400&fit=crop',
        ],
        caption: 'Destapación de cañería principal',
        description: 'Destapación de cañería principal de desagüe con máquina eléctrica. Problema resuelto en 2 horas.',
        date: '2026-02-20',
        category: 'terminado',
        tags: ['Destapación', 'Urgencia', 'Desagüe'],
        likes: 25,
        comments: 4,
        location: 'Villa Mitre',
    },
    {
        id: 14,
        professionalId: 3,
        images: [
            'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=600&fit=crop',
        ],
        caption: 'Instalación de termotanque solar',
        description: 'Primer termotanque solar que instalo en Bahía Blanca. Incluye panel colector y tanque de 200L. El cliente ahorra hasta un 70% en gas.',
        date: '2026-01-30',
        category: 'terminado',
        tags: ['Solar', 'Termotanque', 'Ecológico'],
        likes: 112,
        comments: 18,
        location: 'Aldea Romana',
    },

    // ===== Miguel Ángel (id: 4) - Albañil =====
    {
        id: 15,
        professionalId: 4,
        images: [
            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=600&fit=crop',
        ],
        caption: 'Revoque y pintura de fachada',
        description: 'Revoque grueso y fino de fachada completa más pintura exterior. 45m² de superficie trabajada.',
        date: '2026-03-12',
        category: 'antes-despues',
        tags: ['Revoque', 'Fachada', 'Pintura'],
        likes: 56,
        comments: 8,
        location: 'Bahía Blanca',
    },
    {
        id: 16,
        professionalId: 4,
        images: [
            'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop',
        ],
        caption: 'Colocación de cerámicos en cocina',
        description: 'Cerámicos de 60x60 en piso y salpicadero de cocina. Incluye nivelación de contrapiso y tomado de juntas.',
        date: '2026-02-25',
        category: 'terminado',
        tags: ['Cerámicos', 'Cocina', 'Pisos'],
        likes: 34,
        comments: 5,
        location: 'Ing. White',
    },
    {
        id: 17,
        professionalId: 4,
        images: [
            'https://images.unsplash.com/photo-1503387837-b154d5074bd2?w=600&h=600&fit=crop',
        ],
        caption: 'Construcción de pared divisoria',
        description: 'Levantamiento de pared de ladrillos huecos de 15cm para dividir un ambiente grande en dos habitaciones.',
        date: '2026-03-22',
        category: 'en-progreso',
        tags: ['Construcción', 'Ladrillos', 'División'],
        likes: 15,
        comments: 2,
        location: 'Punta Alta',
    },

    // ===== Roberto Díaz (id: 5) - Carpintero =====
    {
        id: 18,
        professionalId: 5,
        images: [
            'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop',
        ],
        caption: 'Mueble de living a medida',
        description: 'Mueble de TV y biblioteca en melamina roble nebraska con puertas push-open. Diseño moderno y funcional.',
        date: '2026-03-01',
        category: 'antes-despues',
        tags: ['Mueble', 'Living', 'A medida'],
        likes: 128,
        comments: 22,
        location: 'Bahía Blanca',
    },
    {
        id: 19,
        professionalId: 5,
        images: [
            'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&h=600&fit=crop',
        ],
        caption: 'Restauración de mesa de algarrobo',
        description: 'Lijado, teñido y laqueado de mesa de algarrobo macizo de los años 80. Quedó como nueva.',
        date: '2026-02-18',
        category: 'terminado',
        tags: ['Restauración', 'Madera', 'Laqueado'],
        likes: 95,
        comments: 14,
        location: 'Villa Mitre',
    },
    {
        id: 20,
        professionalId: 5,
        images: [
            'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=600&h=600&fit=crop',
        ],
        caption: 'Bajo mesada con bacha integrada',
        description: 'Bajo mesada de cocina en melamina blanca con bacha de acero inoxidable empotrada. Incluye cajones con correderas telescópicas.',
        date: '2026-02-05',
        category: 'terminado',
        tags: ['Cocina', 'Bajo mesada', 'Melamina'],
        likes: 67,
        comments: 9,
        location: 'Centro',
    },
    {
        id: 21,
        professionalId: 5,
        images: [
            'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=600&h=600&fit=crop',
        ],
        caption: 'Placard empotrado en dormitorio',
        description: 'Placard de 2.40m de ancho con puertas corredizas y espejo. Interior con barrales, estantes y cajonera.',
        date: '2026-03-19',
        category: 'en-progreso',
        tags: ['Placard', 'Dormitorio', 'Corredizo'],
        likes: 41,
        comments: 6,
        location: 'Patagonia',
    },
];

export function getPortfolioFor(professionalId: number): PortfolioItem[] {
    return MOCK_PORTFOLIO.filter(item => item.professionalId === professionalId);
}

export function getPortfolioStats(professionalId: number) {
    const items = getPortfolioFor(professionalId);
    return {
        totalPhotos: items.reduce((sum, item) => sum + item.images.length, 0),
        totalLikes: items.reduce((sum, item) => sum + item.likes, 0),
        totalComments: items.reduce((sum, item) => sum + item.comments, 0),
        totalProjects: items.length,
    };
}
