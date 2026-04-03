import { useState } from 'react';
import { Camera, Heart, ArrowUpRight, Images, Sparkles } from 'lucide-react';
import { PortfolioViewer } from './PortfolioViewer';
import { PORTFOLIO_CATEGORIES, getPortfolioStats } from '../../data/mockPortfolio';
import type { PortfolioItem, PortfolioCategory } from '../../data/mockPortfolio';
import clsx from 'clsx';

interface PortfolioGalleryProps {
    items: PortfolioItem[];
    professionalId: number;
}

export function PortfolioGallery({ items, professionalId }: PortfolioGalleryProps) {
    const [activeFilter, setActiveFilter] = useState<PortfolioCategory | 'all'>('all');
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);

    const stats = getPortfolioStats(professionalId);

    const filteredItems = activeFilter === 'all'
        ? items
        : items.filter(item => item.category === activeFilter);

    const getCategoryBadgeStyle = (category: PortfolioCategory) => {
        switch (category) {
            case 'antes-despues': return 'bg-purple-500/80';
            case 'en-progreso': return 'bg-amber-500/80';
            case 'terminado': return 'bg-emerald-500/80';
            default: return 'bg-slate-500/80';
        }
    };

    const getCategoryLabel = (category: PortfolioCategory) => {
        switch (category) {
            case 'antes-despues': return '🔄';
            case 'en-progreso': return '🔨';
            case 'terminado': return '✅';
            default: return '📸';
        }
    };

    if (items.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Camera size={28} className="text-slate-300" />
                </div>
                <h3 className="font-bold text-slate-700 mb-1">Sin trabajos publicados</h3>
                <p className="text-xs text-slate-400 max-w-[220px] mx-auto">
                    Este profesional aún no ha subido fotos de sus trabajos realizados.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header with Stats */}
            <div className="p-5 pb-3">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Sparkles size={14} className="text-emerald-500" />
                        Trabajos realizados
                    </h2>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                            <Images size={12} />
                            {stats.totalPhotos} fotos
                        </span>
                        <span className="flex items-center gap-1">
                            <Heart size={12} className="text-red-400" />
                            {stats.totalLikes}
                        </span>
                    </div>
                </div>

                {/* Filter Chips */}
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={clsx(
                            "shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border",
                            activeFilter === 'all'
                                ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                        )}
                    >
                        Todos ({items.length})
                    </button>
                    {PORTFOLIO_CATEGORIES.map(cat => {
                        const count = items.filter(i => i.category === cat.id).length;
                        if (count === 0) return null;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveFilter(cat.id)}
                                className={clsx(
                                    "shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border flex items-center gap-1",
                                    activeFilter === cat.id
                                        ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                )}
                            >
                                <span>{cat.emoji}</span>
                                {cat.label} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-3 gap-[2px] bg-slate-100">
                {filteredItems.map((item, index) => (
                    <button
                        key={item.id}
                        onClick={() => setViewerIndex(index)}
                        className="relative aspect-square overflow-hidden group focus:outline-none"
                    >
                        <img
                            src={item.images[0]}
                            alt={item.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                        />

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 group-active:bg-black/50 transition-colors flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100">
                            <div className="flex items-center gap-3 text-white font-bold text-xs">
                                <span className="flex items-center gap-1">
                                    <Heart size={14} className="fill-white" />
                                    {item.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                    <ArrowUpRight size={14} />
                                    Ver
                                </span>
                            </div>
                        </div>

                        {/* Category badge */}
                        <div className={`absolute top-1.5 left-1.5 ${getCategoryBadgeStyle(item.category)} backdrop-blur-sm text-white text-[9px] font-bold w-5 h-5 rounded-md flex items-center justify-center`}>
                            {getCategoryLabel(item.category)}
                        </div>

                        {/* Multi-image indicator */}
                        {item.images.length > 1 && (
                            <div className="absolute top-1.5 right-1.5 bg-black/50 backdrop-blur-sm text-white rounded-md p-0.5">
                                <Images size={12} />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Show more indicator */}
            {filteredItems.length > 6 && (
                <div className="p-3 text-center border-t border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">
                        Mostrando {filteredItems.length} trabajos
                    </span>
                </div>
            )}

            {/* Fullscreen Viewer */}
            {viewerIndex !== null && (
                <PortfolioViewer
                    items={filteredItems}
                    initialIndex={viewerIndex}
                    onClose={() => setViewerIndex(null)}
                />
            )}
        </div>
    );
}
