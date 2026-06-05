import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { trapFocus } from '../../lib/a11y';

interface TxBottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/** Mobile-native bottom sheet with safe-area padding and focus trap. */
export function TxBottomSheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: TxBottomSheetProps) {
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
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center">
      <button
        type="button"
        aria-label="Close sheet"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tx-sheet-title"
        className={clsx(
          'relative w-full max-w-lg max-h-[min(86dvh,760px)] overflow-hidden',
          'rounded-t-[var(--tx-r-32)] md:rounded-[var(--tx-r-24)]',
          'border border-[var(--tx-line-2)] bg-[var(--tx-bg-1)] shadow-[var(--tx-shadow-float)]',
          'flex flex-col animate-slide-up',
          className
        )}
      >
        <div className="flex justify-center pt-2 pb-1 md:hidden">
          <span className="h-1 w-10 rounded-full bg-[var(--tx-line-2)]" aria-hidden />
        </div>
        <div className="flex items-start justify-between gap-3 px-4 pb-3 border-b border-[var(--tx-line-1)]">
          <div className="min-w-0">
            <h2 id="tx-sheet-title" className="text-lg font-bold text-[var(--tx-text-1)]">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-[var(--tx-text-3)]">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[var(--tx-radius-sm)] text-[var(--tx-text-3)] hover:bg-[var(--tx-surface-1)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer && (
          <div
            className="sticky bottom-0 border-t border-[var(--tx-line-1)] bg-[var(--tx-bg-1)] px-4 py-3"
            style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
