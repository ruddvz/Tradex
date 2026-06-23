import { TxCard } from '../ui/TxCard';
import { TxButton } from '../ui/TxButton';
import { TxInput } from '../ui/TxField';
import { TxSegmentedControl } from '../ui/TxSegmentedControl';

interface PaperOrderTicketProps {
  symbol: string;
  side: 'buy' | 'sell';
  lotSize: string;
  refPrice: string;
  stopLoss: string;
  busy: boolean;
  onSymbolChange: (v: string) => void;
  onSideChange: (v: 'buy' | 'sell') => void;
  onLotSizeChange: (v: string) => void;
  onRefPriceChange: (v: string) => void;
  onStopLossChange: (v: string) => void;
  onSubmit: () => void;
  estimatedRisk?: string;
}

export function PaperOrderTicket({
  symbol,
  side,
  lotSize,
  refPrice,
  stopLoss,
  busy,
  onSymbolChange,
  onSideChange,
  onLotSizeChange,
  onRefPriceChange,
  onStopLossChange,
  onSubmit,
  estimatedRisk,
}: PaperOrderTicketProps) {
  const slMissing = !stopLoss.trim() || Number.isNaN(parseFloat(stopLoss));

  return (
    <TxCard title="Paper order ticket" subtitle="Simulated only — live execution disabled">
      <div className="space-y-4">
        <TxInput label="Symbol" value={symbol} onChange={(e) => onSymbolChange(e.target.value)} />
        <div>
          <p className="mb-2 text-[13px] font-semibold text-[var(--tx-text-3)]">Side</p>
          <TxSegmentedControl
            items={[
              { id: 'buy', label: 'Buy' },
              { id: 'sell', label: 'Sell' },
            ]}
            value={side}
            onChange={(id) => onSideChange(id as 'buy' | 'sell')}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TxInput
            label="Lots"
            value={lotSize}
            onChange={(e) => onLotSizeChange(e.target.value)}
            inputMode="decimal"
          />
          <TxInput
            label="Reference price"
            value={refPrice}
            onChange={(e) => onRefPriceChange(e.target.value)}
            inputMode="decimal"
          />
        </div>
        <TxInput
          label="Stop loss (required)"
          value={stopLoss}
          onChange={(e) => onStopLossChange(e.target.value)}
          inputMode="decimal"
          error={slMissing ? 'Stop loss is required for paper orders' : undefined}
        />
        {estimatedRisk && (
          <p className="rounded-[var(--tx-r-16)] border border-[var(--tx-warning)]/30 bg-[var(--tx-warning-soft)] px-3 py-2 text-xs text-[var(--tx-warning)]">
            Estimated risk: {estimatedRisk}
          </p>
        )}
        <TxButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={busy || slMissing}
          onClick={onSubmit}
        >
          Submit paper order
        </TxButton>
      </div>
    </TxCard>
  );
}
