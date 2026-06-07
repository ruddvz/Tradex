import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { trapFocus } from '../../lib/a11y';

interface TxDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'md' | 'lg';
}

export function TxDrawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'md',
}: TxDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const release = panelRef.current ? trapFocus(panelRef.current) : undefined;
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      release?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] hidden md:flex justify-end">
      <button
        type="button"
        aria-label="Close drawer"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={clsx(
          'relative flex h-full flex-col border-l border-[var(--tx-line-2)] bg-[var(--tx-bg-1)] shadow-[var(--tx-shadow-float)]',
          width === 'md' ? 'w-[min(520px,100vw)]' : 'w-[min(560px,100vw)]'
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--tx-line-1)] px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--tx-text-1)]">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-[var(--tx-text-3)]">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--tx-r-14)] text-[var(--tx-text-3)] hover:bg-[var(--tx-surface-1)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-[var(--tx-line-1)] px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
