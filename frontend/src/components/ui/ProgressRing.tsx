import { useId } from 'react';
import { clsx } from 'clsx';

interface ProgressRingProps {
  /** 0–100 */
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  tone?: 'success' | 'warning' | 'danger' | 'analytics';
}

const toneStroke: Record<NonNullable<ProgressRingProps['tone']>, string> = {
  success: '#2DD4A3',
  warning: '#F6B73C',
  danger: '#EF5F5F',
  analytics: '#4A9DFF',
};

/** Circular progress ring — hero metric for Prop Firm (Ui.md §9.12). */
export function ProgressRing({
  value,
  size = 200,
  stroke = 14,
  className,
  tone = 'success',
}: ProgressRingProps) {
  const gid = useId();
  const gradId = `ringGrad-${gid.replace(/:/g, '')}`;
  const pct = Math.min(100, Math.max(0, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c - (pct / 100) * c;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size} className={clsx('shrink-0', className)} aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={toneStroke[tone]} stopOpacity={0.85} />
          <stop offset="100%" stopColor={toneStroke[tone]} stopOpacity={1} />
        </linearGradient>
      </defs>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(126, 146, 185, 0.14)"
        strokeWidth={stroke}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={dash}
        className="motion-tab"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </svg>
  );
}
