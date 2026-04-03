import { BottomNav } from './BottomNav';
import { Outlet } from 'react-router-dom';

export function Layout() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 relative pb-16">
            {/* pb-16 adds padding-bottom to avoid content being hidden behind the fixed BottomNav */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
}
