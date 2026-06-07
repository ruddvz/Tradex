import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { trapFocus } from '../../lib/a11y';

interface TxModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function TxModal({ open, onClose, title, children, footer, className }: TxModalProps) {
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={clsx(
          'relative w-full max-w-md rounded-[var(--tx-r-24)] border border-[var(--tx-line-2)]',
          'bg-[var(--tx-bg-1)] shadow-[var(--tx-shadow-float)]',
          className
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--tx-line-1)] px-5 py-4">
          <h2 className="text-lg font-bold text-[var(--tx-text-1)]">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--tx-r-14)]"
          >
            <X className="h-5 w-5 text-[var(--tx-text-3)]" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div
            className="border-t border-[var(--tx-line-1)] px-5 py-4"
            style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
