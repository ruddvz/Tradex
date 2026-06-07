import { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { AppShellSkeleton } from './AppShellSkeleton';
import { RouteFallback } from './RouteFallback';
import { Mt5SyncModal } from '../mt5/Mt5SyncModal';
import { IosInstallBanner } from '../pwa/IosInstallBanner';
import { useStore } from '../../store/useStore';
import { clsx } from 'clsx';

export function Layout() {
  const location = useLocation();
  const { sidebarOpen, mt5SyncModalOpen, hydrateLiveSession } = useStore();
  const [bootOverlay, setBootOverlay] = useState(true);
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  );

  useEffect(() => {
    void hydrateLiveSession();
  }, [hydrateLiveSession]);

  useEffect(() => {
    const onUp = () => {
      setOnline(true);
      void useStore.getState().hydrateLiveSession();
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
    const run = async () => {
      const fontsReady =
        typeof document !== 'undefined' && document.fonts?.ready
          ? document.fonts.ready
          : Promise.resolve();
      await Promise.all([hydrateLiveSession(), fontsReady]);
      endBoot();
    };
    void run();
  }, [hydrateLiveSession]);

  return (
    <div className="tx-app-shell min-h-screen flex app-bg">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div
        className={clsx(
          'tx-main-shell relative flex-1 min-h-screen transition-all duration-300',
          sidebarOpen ? 'md:ml-[var(--tx-sidebar-w)]' : 'md:ml-[var(--tx-sidebar-w-collapsed)]'
        )}
      >
        {!online && (
          <div
            role="status"
            className="no-print sticky top-0 z-[25] px-4 py-2 text-center text-xs font-semibold text-amber-100 bg-amber-950/90 border-b border-amber-500/30 pt-[env(safe-area-inset-top)]"
          >
            You are offline — showing the cached app shell. Reconnect to refresh live journal data
            from the API.
          </div>
        )}
        {bootOverlay && (
          <div className="absolute inset-0 z-[35] bg-bg-primary animate-fade-in">
            <AppShellSkeleton />
          </div>
        )}
        <main
          key={location.pathname}
          className={clsx(
            'tx-page-host animate-fade-in transition-opacity duration-300',
            bootOverlay && 'opacity-0 pointer-events-none select-none'
          )}
        >
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>

        <div className="block md:hidden">
          <IosInstallBanner />
          <MobileNav />
        </div>
      </div>

      <Mt5SyncModal open={mt5SyncModalOpen} />
    </div>
  );
}
