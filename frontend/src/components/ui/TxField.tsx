import { clsx } from 'clsx';
import { Search } from 'lucide-react';

const fieldClass = (error?: string) =>
  clsx(
    'w-full min-h-[48px] rounded-[var(--tx-r-16)] border bg-[var(--tx-surface-inset)] px-3 py-2.5',
    'text-base text-[var(--tx-text-1)] placeholder:text-[var(--tx-text-4)]',
    'transition-colors duration-[var(--tx-motion-fast)]',
    error
      ? 'border-[var(--tx-loss)] focus:ring-2 focus:ring-[var(--tx-loss)]/30'
      : 'border-[var(--tx-line-1)] focus:border-[var(--tx-line-focus)] focus:ring-2 focus:ring-[var(--tx-line-focus)]/25'
  );

interface FieldWrapProps {
  label?: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

function FieldWrap({ label, helper, error, children, className }: FieldWrapProps) {
  return (
    <label className={clsx('block space-y-1.5', className)}>
      {label && (
        <span
          className={clsx(
            'text-[13px] font-semibold',
            error ? 'text-[var(--tx-loss)]' : 'text-[var(--tx-text-3)]'
          )}
        >
          {label}
        </span>
      )}
      {children}
      {error && <span className="text-xs text-[var(--tx-loss)]">{error}</span>}
      {!error && helper && <span className="text-xs text-[var(--tx-text-4)]">{helper}</span>}
    </label>
  );
}

export interface TxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
}

export function TxInput({ label, helper, error, className, id, ...props }: TxInputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <FieldWrap label={label} helper={helper} error={error}>
      <input id={inputId} className={clsx(fieldClass(error), className)} {...props} />
    </FieldWrap>
  );
}

export interface TxSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helper?: string;
  error?: string;
}

export function TxSelect({
  label,
  helper,
  error,
  className,
  id,
  children,
  ...props
}: TxSelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <FieldWrap label={label} helper={helper} error={error}>
      <select
        id={selectId}
        className={clsx(fieldClass(error), 'appearance-none', className)}
        {...props}
      >
        {children}
      </select>
    </FieldWrap>
  );
}

export interface TxTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helper?: string;
  error?: string;
}

export function TxTextarea({ label, helper, error, className, id, ...props }: TxTextareaProps) {
  const areaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <FieldWrap label={label} helper={helper} error={error}>
      <textarea
        id={areaId}
        className={clsx(fieldClass(error), 'min-h-[120px] resize-y', className)}
        {...props}
      />
    </FieldWrap>
  );
}

export interface TxSearchFieldProps extends Omit<TxInputProps, 'type'> {
  onClear?: () => void;
}

export function TxSearchField({ className, ...props }: TxSearchFieldProps) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tx-text-4)]"
        aria-hidden
      />
      <input
        type="search"
        enterKeyHint="search"
        className={clsx(fieldClass(), 'pl-10', className)}
        {...props}
      />
    </div>
  );
}
