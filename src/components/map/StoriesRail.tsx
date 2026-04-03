import { MOCK_PROFESSIONALS } from '../../data/mockUsers';
import { Flame } from 'lucide-react';
import clsx from 'clsx';

interface StoriesRailProps {
    onSelectProfessional: (id: number) => void;
}

export function StoriesRail({ onSelectProfessional }: StoriesRailProps) {
    return (
        <div className="overflow-x-auto no-scrollbar py-4 pl-4 bg-white border-b border-slate-100">
            <div className="flex gap-4 min-w-max pr-4">
                {/* My Story Button */}
                <button className="flex flex-col items-center gap-1 group">
                    <div className="w-[60px] h-[60px] rounded-full border-2 border-slate-200 border-dashed flex items-center justify-center bg-slate-50 text-slate-400 group-hover:border-emerald-500 group-hover:text-emerald-500 transition-colors">
                        <span className="text-2xl font-light">+</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-700">Tu historia</span>
                </button>

                {MOCK_PROFESSIONALS.map((pro) => (
                    <button
                        key={pro.id}
                        onClick={() => onSelectProfessional(pro.id)}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className="relative">
                            <div className={clsx(
                                "p-[2px] rounded-full",
                                pro.isBoosted
                                    ? "bg-gradient-to-tr from-amber-300 to-orange-500"
                                    : "bg-gradient-to-tr from-emerald-300 to-emerald-500"
                            )}>
                                <img
                                    src={pro.image}
                                    alt={pro.name}
                                    className="w-[56px] h-[56px] rounded-full border-2 border-white object-cover"
                                />
                            </div>

                            {pro.isBoosted && (
                                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                    <Flame size={10} fill="currentColor" />
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] font-medium text-slate-700 max-w-[60px] truncate text-center bg-white/80 backdrop-blur-sm px-1.5 rounded-md shadow-sm">
                            {pro.name.split(' ')[0]}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
