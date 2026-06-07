import { TxCard } from '../ui/TxCard';

interface ReportInsightCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

/** Chart / analytics block wrapper for Reports (§5). */
export function ReportInsightCard({
  title,
  subtitle,
  children,
  className,
}: ReportInsightCardProps) {
  return (
    <TxCard className={className}>
      <h3 className="section-title text-base mb-1">{title}</h3>
      {subtitle ? <p className="section-subtitle mb-4">{subtitle}</p> : null}
      {children}
    </TxCard>
  );
}
