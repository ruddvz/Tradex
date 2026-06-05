import { useStore } from '../../store/useStore';

/** Shell-wide trading account picker (live mode only). */
export function AccountSelector({ compact = false }: { compact?: boolean }) {
  const { dataMode, tradingAccounts, selectedTradingAccountId, setSelectedTradingAccountId } =
    useStore();

  if (dataMode !== 'live' || tradingAccounts.length === 0) return null;

  return (
    <label
      className={
        compact
          ? 'flex items-center gap-2 text-xs text-text-muted shrink-0'
          : 'hidden lg:flex items-center gap-2 text-xs text-text-muted shrink-0'
      }
    >
      <span className="sr-only">Trading account</span>
      <select
        id="header-trading-account"
        className="select text-xs py-1.5 max-w-[10rem]"
        value={selectedTradingAccountId ?? ''}
        onChange={(e) => setSelectedTradingAccountId(e.target.value || null)}
      >
        {tradingAccounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
    </label>
  );
}
