import { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { AppShellSkeleton } from './AppShellSkeleton';
import { RouteFallback } from './RouteFallback';
import { Mt5SyncModal } from '../mt5/Mt5SyncModal';
import { useStore } from '../../store/useStore';
import { clsx } from 'clsx';

export function Layout() {
  const { sidebarOpen, mt5SyncModalOpen } = useStore();
  const location = useLocation();
  const [bootOverlay, setBootOverlay] = useState(true);

  useEffect(() => {
    void useStore.getState().refreshPaperAccountsFromApi();
  }, [location.pathname]);

  useEffect(() => {
    const start = performance.now();
    const minMs = 280;
    const endBoot = () => {
      const elapsed = performance.now() - start;
      window.setTimeout(() => setBootOverlay(false), Math.max(0, minMs - elapsed));
    };
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      void document.fonts.ready.then(endBoot);
    } else {
      endBoot();
    }
  }, []);

  return (
    <div className="min-h-screen flex app-bg">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main
        className={clsx(
          'relative flex-1 min-h-screen transition-all duration-300 ease-in-out',
          sidebarOpen ? 'md:ml-64' : 'md:ml-16',
          'pb-28 md:pb-0'
        )}
      >
        {bootOverlay && (
          <div className="absolute inset-0 z-[35] bg-bg-primary animate-fade-in">
            <AppShellSkeleton />
          </div>
        )}
        <div
          key={location.pathname}
          className={clsx(
            'animate-fade-in min-h-screen transition-opacity duration-300',
            bootOverlay && 'opacity-0 pointer-events-none select-none'
          )}
        >
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <div className="block md:hidden">
        <MobileNav />
      </div>

      <Mt5SyncModal open={mt5SyncModalOpen} />
    </div>
  );
}
