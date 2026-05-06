import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useStore } from '../../store/useStore';
import { clsx } from 'clsx';

export function Layout() {
  const { sidebarOpen } = useStore();

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className={clsx(
        'flex-1 min-h-screen transition-all duration-300 ease-in-out',
        sidebarOpen ? 'ml-64' : 'ml-16'
      )}>
        <div className="min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
