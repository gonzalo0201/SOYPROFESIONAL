// 3-tier search model: Category → Service → Task

export interface ServiceTask {
    id: string;
    name: string;
}

export interface Service {
    id: string;
    name: string;
    tasks: ServiceTask[];
}

export interface Category {
    id: string;
    name: string;
    icon: string; // emoji
    services: Service[];
}

export const CATEGORIES: Category[] = [
    {
        id: 'automotor',
        name: 'Automotor',
        icon: '🚗',
        services: [
            {
                id: 'lavadero',
                name: 'Lavadero de Autos',
                tasks: [
                    { id: 'lavado-ext', name: 'Lavado exterior de auto' },
                    { id: 'lavado-int', name: 'Lavado interior de auto' },
                    { id: 'ceramico', name: 'Tratamiento cerámico exterior' },
                    { id: 'silicona', name: 'Tratamiento de silicona interior' },
                    { id: 'butacas', name: 'Limpieza de asientos / butacas' },
                    { id: 'opticas', name: 'Pulido de ópticas' },
                ],
            },
            {
                id: 'mecanica-integral',
                name: 'Mecánica Integral',
                tasks: [
                    { id: 'motor', name: 'Reparación de motor' },
                    { id: 'transmision', name: 'Reparación de transmisión' },
                    { id: 'frenos', name: 'Cambio de pastillas y discos' },
                    { id: 'suspension', name: 'Reparación de suspensión' },
                ],
            },
            {
                id: 'mecanica-liviana',
                name: 'Mecánica Liviana',
                tasks: [
                    { id: 'aceite', name: 'Cambio de aceite y filtros' },
                    { id: 'bujias', name: 'Cambio de bujías' },
                    { id: 'bateria', name: 'Cambio de batería' },
                    { id: 'correas', name: 'Cambio de correas' },
                ],
            },
            {
                id: 'mecanica-direccion',
                name: 'Mecánica de Dirección',
                tasks: [
                    { id: 'alineacion', name: 'Alineación y balanceo' },
                    { id: 'cremallera', name: 'Reparación de cremallera' },
                    { id: 'bomba-dir', name: 'Cambio de bomba de dirección' },
                ],
            },
            {
                id: 'service',
                name: 'Service de Autos',
                tasks: [
                    { id: 'service-10k', name: 'Service 10.000 km' },
                    { id: 'service-20k', name: 'Service 20.000 km' },
                    { id: 'service-completo', name: 'Service completo' },
                    { id: 'pre-vtv', name: 'Revisión pre-VTV' },
                ],
            },
            {
                id: 'gomeria',
                name: 'Gomería',
                tasks: [
                    { id: 'cambio-cubierta', name: 'Cambio de cubiertas' },
                    { id: 'parche', name: 'Reparación / parche' },
                    { id: 'balanceo', name: 'Balanceo' },
                ],
            },
            {
                id: 'ploteo',
                name: 'Ploteo de Autos',
                tasks: [
                    { id: 'ploteo-total', name: 'Ploteo total del vehículo' },
                    { id: 'ploteo-parcial', name: 'Ploteo parcial' },
                    { id: 'vinilo', name: 'Aplicación de vinilo' },
                ],
            },
            {
                id: 'polarizado',
                name: 'Polarizado de Autos',
                tasks: [
                    { id: 'polar-total', name: 'Polarizado completo' },
                    { id: 'polar-parcial', name: 'Polarizado parcial' },
                    { id: 'desp-polar', name: 'Despolarizado' },
                ],
            },
        ],
    },
    {
        id: 'hogar',
        name: 'Hogar',
        icon: '🏠',
        services: [
            {
                id: 'gasista',
                name: 'Gasista',
                tasks: [
                    { id: 'inst-gas', name: 'Instalación de gas' },
                    { id: 'rep-calefa', name: 'Reparación de calefón' },
                    { id: 'mant-estufa', name: 'Mantenimiento de estufa' },
                    { id: 'perdida-gas', name: 'Detección de pérdidas de gas' },
                ],
            },
            {
                id: 'plomero',
                name: 'Plomero',
                tasks: [
                    { id: 'destape', name: 'Destape de cañerías' },
                    { id: 'inst-bano', name: 'Instalación sanitaria' },
                    { id: 'rep-canilla', name: 'Reparación de canillas/grifos' },
                    { id: 'tanque', name: 'Instalación de tanque de agua' },
                ],
            },
            {
                id: 'electricista',
                name: 'Electricista',
                tasks: [
                    { id: 'inst-elec', name: 'Instalación eléctrica completa' },
                    { id: 'tablero', name: 'Armado de tablero eléctrico' },
                    { id: 'rep-corto', name: 'Reparación de cortocircuitos' },
                    { id: 'iluminacion', name: 'Instalación de iluminación' },
                ],
            },
            {
                id: 'pintor',
                name: 'Pintor',
                tasks: [
                    { id: 'pintura-int', name: 'Pintura interior' },
                    { id: 'pintura-ext', name: 'Pintura exterior' },
                    { id: 'enduido', name: 'Enduido y alisado' },
                    { id: 'impermeab', name: 'Impermeabilización' },
                ],
            },
            {
                id: 'albanil',
                name: 'Albañil',
                tasks: [
                    { id: 'construccion', name: 'Construcción en general' },
                    { id: 'remodelacion', name: 'Remodelación' },
                    { id: 'contrapiso', name: 'Contrapiso y carpeta' },
                    { id: 'medianera', name: 'Levantamiento de medianera' },
                ],
            },
            {
                id: 'carpintero',
                name: 'Carpintero',
                tasks: [
                    { id: 'mueble-medida', name: 'Muebles a medida' },
                    { id: 'rep-mueble', name: 'Reparación de muebles' },
                    { id: 'inst-cocina', name: 'Instalación de cocina' },
                    { id: 'deck', name: 'Construcción de deck' },
                ],
            },
        ],
    },
    {
        id: 'tecnologia',
        name: 'Tecnología',
        icon: '💻',
        services: [
            {
                id: 'tecnico-pc',
                name: 'Técnico de PC',
                tasks: [
                    { id: 'rep-pc', name: 'Reparación de computadoras' },
                    { id: 'format', name: 'Formateo e instalación de SO' },
                    { id: 'upgrade', name: 'Upgrade de componentes' },
                    { id: 'red', name: 'Configuración de redes' },
                ],
            },
            {
                id: 'celulares',
                name: 'Reparación de Celulares',
                tasks: [
                    { id: 'pantalla', name: 'Cambio de pantalla' },
                    { id: 'bateria-cel', name: 'Cambio de batería' },
                    { id: 'software', name: 'Problemas de software' },
                ],
            },
        ],
    },
    {
        id: 'salud-belleza',
        name: 'Salud y Belleza',
        icon: '💆',
        services: [
            {
                id: 'peluqueria',
                name: 'Peluquería',
                tasks: [
                    { id: 'corte', name: 'Corte de cabello' },
                    { id: 'tintura', name: 'Tintura / Color' },
                    { id: 'alisado', name: 'Alisado / Keratina' },
                    { id: 'peinado', name: 'Peinado para eventos' },
                ],
            },
            {
                id: 'manicura',
                name: 'Manicura / Pedicura',
                tasks: [
                    { id: 'unas-gel', name: 'Uñas en gel' },
                    { id: 'unas-acrilicas', name: 'Uñas acrílicas' },
                    { id: 'pedicura', name: 'Pedicura completa' },
                ],
            },
        ],
    },
];
