import { TxCard } from '../ui/TxCard';
import { PaperAccountStats } from './PaperAccountStats';
import type { PaperAccount } from '../../types';

interface PaperHeroCardProps {
  account: PaperAccount;
  openPositions: number;
  recentFills: number;
  statusLabel?: string;
}

export function PaperHeroCard({
  account,
  openPositions,
  recentFills,
  statusLabel = 'Paper mode',
}: PaperHeroCardProps) {
  return (
    <TxCard variant="info" title="Paper Bot" subtitle={statusLabel}>
      <PaperAccountStats
        account={account}
        openPositions={openPositions}
        recentFills={recentFills}
      />
    </TxCard>
  );
}
