import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import type { Professional } from '../../data/mockUsers';

interface StoryViewerProps {
    professional: Professional;
    onClose: () => void;
    onNext?: () => void;
    onPrev?: () => void;
    hasNext: boolean;
    hasPrev: boolean;
}

// Mock story content for each professional
function getStoryContent(pro: Professional) {
    const stories: Record<number, { image: string; caption: string; timeAgo: string }[]> = {
        1: [
            { image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=900&fit=crop', caption: '✅ Instalación de calefón Orbis completada. ¡Cliente feliz! 🔥', timeAgo: '2h' },
            { image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=900&fit=crop', caption: 'Certificación de gas en departamento. Siempre con seguridad 🛡️', timeAgo: '5h' },
        ],
        2: [
            { image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=900&fit=crop', caption: '⚡ Tablero eléctrico nuevo. De 4 a 12 módulos 💪', timeAgo: '1h' },
        ],
        3: [
            { image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=900&fit=crop', caption: '🔧 Reparación de cañería. Problema solucionado en 1 hora 🚿', timeAgo: '4h' },
        ],
        4: [
            { image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=900&fit=crop', caption: '🏠 Pintura completa de living. ¡Transformación total!', timeAgo: '3h' },
        ],
        5: [
            { image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=900&fit=crop', caption: '❄️ Instalación de split frío/calor. Listo para el verano ☀️', timeAgo: '6h' },
        ],
    };
    return stories[pro.id] || [
        { image: pro.image, caption: `${pro.name} - ${pro.trade}`, timeAgo: '1h' }
    ];
}

export function StoryViewer({ professional, onClose, onNext, onPrev, hasNext, hasPrev }: StoryViewerProps) {
    const stories = getStoryContent(professional);
    const [currentStory, setCurrentStory] = useState(0);
    const [progress, setProgress] = useState(0);
    const goToNextRef = useRef<() => void>(() => {});

    const goToNext = useCallback(() => {
        if (currentStory < stories.length - 1) {
            setCurrentStory(prev => prev + 1);
            setProgress(0);
        } else if (hasNext && onNext) {
            onNext();
        } else {
            onClose();
        }
    }, [currentStory, stories.length, hasNext, onNext, onClose]);

    const goToPrev = useCallback(() => {
        if (currentStory > 0) {
            setCurrentStory(prev => prev - 1);
            setProgress(0);
        } else if (hasPrev && onPrev) {
            onPrev();
        }
    }, [currentStory, hasPrev, onPrev]);

    // Keep ref in sync with latest goToNext
    useEffect(() => {
        goToNextRef.current = goToNext;
    }, [goToNext]);

    // Auto-advance timer (5 seconds per story)
    useEffect(() => {
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    goToNextRef.current();
                    return 0;
                }
                return prev + 2; // 50 steps × 100ms = 5s
            });
        }, 100);
        return () => clearInterval(interval);
    }, [currentStory, professional.id]);

    // Reset when professional changes
    useEffect(() => {
        setCurrentStory(0);
        setProgress(0);
    }, [professional.id]);

    const story = stories[currentStory];

    return (
        <div className="fixed inset-0 bg-black z-[9999] flex flex-col">
            {/* Progress bars */}
            <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2 pt-3">
                {stories.map((_, idx) => (
                    <div key={idx} className="flex-1 h-[3px] rounded-full bg-white/30 overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
                            style={{
                                width: idx < currentStory ? '100%'
                                    : idx === currentStory ? `${progress}%`
                                    : '0%'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="absolute top-6 left-0 right-0 z-20 flex items-center gap-3 px-4 py-2">
                <img
                    src={professional.image}
                    alt={professional.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white/50"
                />
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm truncate">{professional.name}</h3>
                    <div className="flex items-center gap-1 text-white/60 text-[11px]">
                        <Clock size={10} />
                        <span>Hace {story.timeAgo}</span>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-white/80 hover:text-white active:scale-90 transition-all"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Story image */}
            <div className="flex-1 relative">
                <img
                    src={story.image}
                    alt=""
                    className="w-full h-full object-cover"
                />
                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />
            </div>

            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-5 pb-8">
                <p className="text-white text-sm font-medium leading-relaxed drop-shadow-lg">
                    {story.caption}
                </p>
                <p className="text-white/50 text-xs mt-2">{professional.trade} · {professional.name}</p>
            </div>

            {/* Tap zones for navigation */}
            <button
                onClick={goToPrev}
                className="absolute left-0 top-16 bottom-16 w-1/3 z-10"
                aria-label="Anterior"
            />
            <button
                onClick={goToNext}
                className="absolute right-0 top-16 bottom-16 w-2/3 z-10"
                aria-label="Siguiente"
            />

            {/* Side arrows (desktop) */}
            {hasPrev && (
                <button onClick={goToPrev} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 rounded-full text-white/70 hover:text-white hidden sm:block">
                    <ChevronLeft size={24} />
                </button>
            )}
            {hasNext && (
                <button onClick={goToNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 rounded-full text-white/70 hover:text-white hidden sm:block">
                    <ChevronRight size={24} />
                </button>
            )}
        </div>
    );
}
