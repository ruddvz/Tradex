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
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  );

  useEffect(() => {
    void useStore.getState().hydrateFromApi();
  }, [location.pathname]);

  useEffect(() => {
    const onUp = () => {
      setOnline(true);
      void useStore.getState().hydrateFromApi();
    };
    const onDown = () => setOnline(false);
    window.addEventListener('online', onUp);
    window.addEventListener('offline', onDown);
    return () => {
      window.removeEventListener('online', onUp);
      window.removeEventListener('offline', onDown);
    };
  }, []);

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
        {!online && (
          <div
            role="status"
            className="no-print sticky top-0 z-[25] px-4 py-2 text-center text-xs font-semibold text-amber-100 bg-amber-950/90 border-b border-amber-500/30"
          >
            You are offline. Reconnect to refresh live journal data from the API.
          </div>
        )}
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
