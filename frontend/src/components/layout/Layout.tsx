import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useStore } from '../../store/useStore';
import { clsx } from 'clsx';

export function Layout() {
  const { sidebarOpen } = useStore();
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-dark-400">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main
        className={clsx(
          'flex-1 min-h-screen transition-all duration-300 ease-in-out',
          sidebarOpen ? 'md:ml-64' : 'md:ml-16',
          'pb-20 md:pb-0'
        )}
      >
        <div key={location.pathname} className="animate-fade-in min-h-screen">
          <Outlet />
        </div>
      </main>

      <div className="block md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}
