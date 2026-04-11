import { useState, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Share2, MapPin, MessageCircle, Calendar } from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import type { PortfolioItem } from '../../data/mockPortfolio';
import clsx from 'clsx';

interface PortfolioViewerProps {
    items: PortfolioItem[];
    initialIndex: number;
    onClose: () => void;
}

export function PortfolioViewer({ items, initialIndex, onClose }: PortfolioViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isLiked, setIsLiked] = useState<Record<string | number, boolean>>({});
    const [isEntering, setIsEntering] = useState(true);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchDiff, setTouchDiff] = useState(0);

    const currentItem = items[currentIndex];

    useEffect(() => {
        requestAnimationFrame(() => setIsEntering(false));
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'ArrowRight') goToNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex]);

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const goToNext = useCallback(() => {
        if (currentIndex < items.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    }, [currentIndex, items.length]);

    const goToPrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    const toggleLike = () => {
        setIsLiked(prev => ({ ...prev, [currentItem.id]: !prev[currentItem.id] }));
    };

    // Touch handlers for swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        setTouchDiff(e.touches[0].clientX - touchStart);
    };

    const handleTouchEnd = () => {
        if (Math.abs(touchDiff) > 60) {
            if (touchDiff > 0) goToPrev();
            else goToNext();
        }
        setTouchStart(null);
        setTouchDiff(0);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'antes-despues': return { label: 'Antes / Después', color: 'bg-purple-500', emoji: '🔄' };
            case 'en-progreso': return { label: 'En progreso', color: 'bg-amber-500', emoji: '🔨' };
            case 'terminado': return { label: 'Terminado', color: 'bg-emerald-500', emoji: '✅' };
            default: return { label: 'General', color: 'bg-slate-500', emoji: '📸' };
        }
    };

    const badge = getCategoryBadge(currentItem.category);

    return (
        <div
            className={clsx(
                "fixed inset-0 z-[2000] bg-black flex flex-col transition-opacity duration-300",
                isEntering ? "opacity-0" : "opacity-100"
            )}
        >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent px-4 pt-4 pb-10">
                <div className="flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-1.5">
                        <span className={`${badge.color} text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1`}>
                            <span>{badge.emoji}</span>
                            {badge.label}
                        </span>
                    </div>

                    <button className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors">
                        <Share2 size={18} />
                    </button>
                </div>

                {/* Counter */}
                <div className="text-center mt-3">
                    <span className="text-white/60 text-xs font-medium">
                        {currentIndex + 1} / {items.length}
                    </span>
                </div>
            </div>

            {/* Image Area */}
            <div
                className="flex-1 flex items-center justify-center relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Navigation arrows (desktop) */}
                {currentIndex > 0 && (
                    <button
                        onClick={goToPrev}
                        className="absolute left-2 z-20 p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/30 transition-colors hidden md:flex"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}
                {currentIndex < items.length - 1 && (
                    <button
                        onClick={goToNext}
                        className="absolute right-2 z-20 p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/30 transition-colors hidden md:flex"
                    >
                        <ChevronRight size={24} />
                    </button>
                )}

                {/* Content */}
                <div
                    className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(${touchDiff * 0.3}px)` }}
                >
                    {currentItem.category === 'antes-despues' && currentItem.images.length >= 2 ? (
                        <div className="w-full max-w-lg mx-auto px-2">
                            <BeforeAfterSlider
                                beforeImage={currentItem.images[0]}
                                afterImage={currentItem.images[1]}
                                className="w-full aspect-[4/3] rounded-2xl"
                            />
                        </div>
                    ) : (
                        <img
                            src={currentItem.images[0]}
                            alt={currentItem.caption}
                            className="max-w-full max-h-[65vh] object-contain rounded-lg"
                            draggable={false}
                        />
                    )}
                </div>
            </div>

            {/* Bottom Info Panel */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/70 to-transparent px-5 pb-6 pt-16">
                {/* Actions */}
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={toggleLike}
                        className="flex items-center gap-1.5 transition-all active:scale-90"
                    >
                        <Heart
                            size={22}
                            className={clsx(
                                "transition-colors",
                                isLiked[currentItem.id]
                                    ? "text-red-500 fill-red-500"
                                    : "text-white"
                            )}
                        />
                        <span className="text-white text-sm font-bold">
                            {currentItem.likes + (isLiked[currentItem.id] ? 1 : 0)}
                        </span>
                    </button>
                    <div className="flex items-center gap-1.5 text-white/70">
                        <MessageCircle size={18} />
                        <span className="text-sm font-medium">{currentItem.comments}</span>
                    </div>
                </div>

                {/* Caption */}
                <h3 className="text-white font-bold text-base mb-1.5 leading-snug">
                    {currentItem.caption}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-3 line-clamp-2">
                    {currentItem.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {currentItem.tags.map(tag => (
                        <span
                            key={tag}
                            className="bg-white/10 text-white/80 text-[10px] font-semibold px-2 py-1 rounded-full backdrop-blur-sm"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-white/50 text-[11px]">
                    <div className="flex items-center gap-1">
                        <Calendar size={11} />
                        <span>{formatDate(currentItem.date)}</span>
                    </div>
                    {currentItem.location && (
                        <div className="flex items-center gap-1">
                            <MapPin size={11} />
                            <span>{currentItem.location}</span>
                        </div>
                    )}
                </div>

                {/* Pagination Dots */}
                <div className="flex items-center justify-center gap-1.5 mt-4">
                    {items.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={clsx(
                                "rounded-full transition-all duration-300",
                                i === currentIndex
                                    ? "w-6 h-1.5 bg-emerald-400"
                                    : "w-1.5 h-1.5 bg-white/30 hover:bg-white/50"
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
