import { useState, useRef, useCallback, useEffect } from 'react';

interface BeforeAfterSliderProps {
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;
    afterLabel?: string;
    className?: string;
}

export function BeforeAfterSlider({
    beforeImage,
    afterImage,
    beforeLabel = 'ANTES',
    afterLabel = 'DESPUÉS',
    className = '',
}: BeforeAfterSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const updatePosition = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(5, Math.min(95, (x / rect.width) * 100));
        setSliderPosition(percentage);
    }, []);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        e.preventDefault();
        setIsDragging(true);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        updatePosition(e.clientX);
    }, [updatePosition]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDragging) return;
        updatePosition(e.clientX);
    }, [isDragging, updatePosition]);

    const handlePointerUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Touch event handling for mobile
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const touchMove = (e: TouchEvent) => {
            if (isDragging) {
                e.preventDefault();
                updatePosition(e.touches[0].clientX);
            }
        };

        container.addEventListener('touchmove', touchMove, { passive: false });
        return () => container.removeEventListener('touchmove', touchMove);
    }, [isDragging, updatePosition]);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden select-none cursor-col-resize ${className}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ touchAction: 'pan-y', containerType: 'inline-size' }}
        >
            {/* After image (background, full) */}
            <img
                src={afterImage}
                alt="Después"
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
            />

            {/* Before image (clipped) */}
            <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${sliderPosition}%` }}
            >
                <img
                    src={beforeImage}
                    alt="Antes"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ width: '100cqw', maxWidth: 'none' }}
                    draggable={false}
                />
            </div>

            {/* Slider line */}
            <div
                className="absolute top-0 bottom-0 z-10 pointer-events-none"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
                {/* Vertical line */}
                <div className="h-full w-[3px] bg-white shadow-lg shadow-black/30" />

                {/* Handle */}
                <div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center transition-transform ${
                        isDragging ? 'scale-110' : 'scale-100'
                    }`}
                >
                    <div className="flex items-center gap-0.5">
                        <svg width="7" height="14" viewBox="0 0 7 14" fill="none">
                            <path d="M6 1L1 7L6 13" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <svg width="7" height="14" viewBox="0 0 7 14" fill="none">
                            <path d="M1 1L6 7L1 13" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Labels */}
            <div
                className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full pointer-events-none transition-opacity"
                style={{ opacity: sliderPosition > 15 ? 1 : 0 }}
            >
                {beforeLabel}
            </div>
            <div
                className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full pointer-events-none transition-opacity"
                style={{ opacity: sliderPosition < 85 ? 1 : 0 }}
            >
                {afterLabel}
            </div>

            {/* Hint animation for first-time users */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                <div className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse">
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                        <path d="M4 6H12M4 6L6 4M4 6L6 8M12 6L10 4M12 6L10 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Deslizá para comparar
                </div>
            </div>
        </div>
    );
}
