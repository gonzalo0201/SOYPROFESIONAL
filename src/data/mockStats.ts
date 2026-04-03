export interface RankingItem {
    trade: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
    change: number; // Percentage change
}

export const MOCK_RANKINGS: Record<string, RankingItem[]> = {
    'Bahía Blanca': [
        { trade: 'Gasista', count: 1250, trend: 'up', change: 15 },
        { trade: 'Plomero', count: 980, trend: 'stable', change: 2 },
        { trade: 'Electricista', count: 850, trend: 'up', change: 8 },
        { trade: 'Albañil', count: 720, trend: 'down', change: -5 },
        { trade: 'Pintor', count: 650, trend: 'up', change: 12 },
        { trade: 'Carpintero', count: 580, trend: 'stable', change: 0 },
        { trade: 'Jardinero', count: 420, trend: 'up', change: 25 },
        { trade: 'Mecánico', count: 350, trend: 'down', change: -2 },
        { trade: 'Flete', count: 300, trend: 'up', change: 5 },
        { trade: 'Techista', count: 280, trend: 'stable', change: 1 },
    ],
    'Buenos Aires': [
        { trade: 'Electricista', count: 5200, trend: 'up', change: 10 },
        { trade: 'Plomero', count: 4800, trend: 'up', change: 5 },
        { trade: 'Gasista', count: 4100, trend: 'down', change: -3 },
        { trade: 'Pintor', count: 3500, trend: 'up', change: 15 },
        { trade: 'Albañil', count: 3200, trend: 'stable', change: 0 },
        { trade: 'Flete', count: 2900, trend: 'up', change: 8 },
        { trade: 'Mecánico', count: 2500, trend: 'stable', change: 1 },
        { trade: 'Carpintero', count: 2100, trend: 'down', change: -5 },
        { trade: 'Techista', count: 1800, trend: 'up', change: 12 },
        { trade: 'Herrero', count: 1500, trend: 'stable', change: 2 },
    ]
};

export const TIME_RANGES = [
    { id: 'week', label: 'Última Semana' },
    { id: 'month', label: 'Último Mes' },
    { id: 'quarter', label: 'Últimos 3 Meses' },
    { id: 'year', label: 'Último Año' },
];
