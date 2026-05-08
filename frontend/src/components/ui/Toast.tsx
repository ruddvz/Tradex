import { useState, useCallback, createContext, useContext } from 'react';
import { CheckCircle2, X, AlertTriangle, Info } from 'lucide-react';
import { clsx } from 'clsx';

/* App pattern: colocate useToast with ToastProvider */
/* eslint-disable react-refresh/only-export-components */

type ToastType = 'success' | 'error' | 'info' | 'warning';
interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const icons = {
    success: CheckCircle2,
    error: X,
    info: Info,
    warning: AlertTriangle,
  };
  const colors = {
    success: 'border-brand-500/40 bg-brand-500/10 text-brand-300',
    error: 'border-red-500/40 bg-red-500/10 text-red-300',
    info: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
    warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => {
          const Icon = icons[toast.type];
          return (
            <div
              key={toast.id}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-card',
                'animate-slide-up pointer-events-auto backdrop-blur-sm',
                'bg-surface/95',
                colors[toast.type]
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium text-white">{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
