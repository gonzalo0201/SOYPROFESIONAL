import type { Trade } from '../../data/mockUsers';
import clsx from 'clsx';

const trades: Trade[] = ['Gasista', 'Plomero', 'Electricista', 'Albañil', 'Carpintero'];

interface FilterBarProps {
    selectedTrade: Trade | null;
    onSelectTrade: (trade: Trade | null) => void;
}

export function FilterBar({ selectedTrade, onSelectTrade }: FilterBarProps) {
    return (
        <div className="absolute top-20 left-0 right-0 z-[400] overflow-x-auto pb-2 pl-4 no-scrollbar">
            <div className="flex gap-2 pr-4">
                <button
                    onClick={() => onSelectTrade(null)}
                    className={clsx(
                        "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border shadow-sm",
                        selectedTrade === null
                            ? "bg-slate-800 text-white border-slate-800"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                >
                    Todos
                </button>
                {trades.map((trade) => (
                    <button
                        key={trade}
                        onClick={() => onSelectTrade(trade === selectedTrade ? null : trade)}
                        className={clsx(
                            "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border shadow-sm",
                            selectedTrade === trade
                                ? "bg-emerald-500 text-white border-emerald-500"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        )}
                    >
                        {trade}
                    </button>
                ))}
            </div>
        </div>
    );
}
