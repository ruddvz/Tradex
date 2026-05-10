import { useState, useMemo } from 'react';
import { Calculator as CalcIcon, AlertTriangle, CheckCircle2, TrendingUp, Copy, Check } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { RiskPath } from '../components/calculator/RiskPath';
import { clsx } from 'clsx';

const instruments = [
  { name: 'XAUUSD', pip: 0.01, pipValue: 1.0 },
  { name: 'EURUSD', pip: 0.0001, pipValue: 10.0 },
  { name: 'GBPUSD', pip: 0.0001, pipValue: 10.0 },
  { name: 'USDJPY', pip: 0.01, pipValue: 9.1 },
  { name: 'GBPJPY', pip: 0.01, pipValue: 9.1 },
  { name: 'US30', pip: 1, pipValue: 1.0 },
  { name: 'NAS100', pip: 1, pipValue: 1.0 },
  { name: 'AUDUSD', pip: 0.0001, pipValue: 10.0 },
];

type CalcMode = 'position' | 'risk';

export function Calculator() {
  const [mode, setMode] = useState<CalcMode>('position');
  const [accountBalance, setAccountBalance] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [entryPrice, setEntryPrice] = useState(2350);
  const [stopLoss, setStopLoss] = useState(2340);
  const [takeProfit, setTakeProfit] = useState(2370);
  const [symbol, setSymbol] = useState('XAUUSD');
  const [copied, setCopied] = useState(false);

  const inst = instruments.find(i => i.name === symbol) || instruments[0];

  const calc = useMemo(() => {
    const riskAmount = accountBalance * (riskPercent / 100);
    const slPips = Math.abs(entryPrice - stopLoss) / inst.pip;
    const tpPips = Math.abs(takeProfit - entryPrice) / inst.pip;
    const lotSize = slPips > 0 ? riskAmount / (slPips * inst.pipValue) : 0;
    const potentialProfit = tpPips * inst.pipValue * lotSize;
    const rr = slPips > 0 ? tpPips / slPips : 0;
    const isLong = entryPrice < takeProfit;

    return {
      riskAmount: parseFloat(riskAmount.toFixed(2)),
      slPips: parseFloat(slPips.toFixed(1)),
      tpPips: parseFloat(tpPips.toFixed(1)),
      lotSize: parseFloat(Math.min(lotSize, 100).toFixed(2)),
      potentialProfit: parseFloat(potentialProfit.toFixed(2)),
      rr: parseFloat(rr.toFixed(2)),
      isLong,
      isGoodRR: rr >= 1.5,
    };
  }, [accountBalance, riskPercent, entryPrice, stopLoss, takeProfit, inst]);

  const slInvalid = useMemo(() => {
    if (calc.isLong) return stopLoss >= entryPrice;
    return stopLoss <= entryPrice;
  }, [calc.isLong, stopLoss, entryPrice]);

  const presetRisks = [0.5, 1, 1.5, 2];

  return (
    <div className="min-h-screen">
      <Header title="Risk Calculator" subtitle="Position sizing & risk engine (Ui.md §10.6)" />

      <div className="page-shell p-6 pb-28">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="flex gap-2">
            <button
              type="button"
              className={clsx('chip flex-1 justify-center min-h-[44px]', mode === 'position' && 'chip-active')}
              onClick={() => setMode('position')}
            >
              Position size
            </button>
            <button
              type="button"
              className={clsx('chip flex-1 justify-center min-h-[44px]', mode === 'risk' && 'chip-active')}
              onClick={() => setMode('risk')}
            >
              Risk analysis
            </button>
          </div>

          {/* Sticky live summary */}
          <div className="sticky top-[4.75rem] z-20 -mx-1 px-1 py-2 rounded-2xl border border-surface-border bg-dark-400/95 backdrop-blur-md shadow-card motion-tab">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center sm:text-left px-2">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">Lots</div>
                <div className="text-lg font-bold text-white tabular-nums">{calc.lotSize}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">Risk</div>
                <div className="text-lg font-bold text-red-400 tabular-nums">${calc.riskAmount}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">R:R</div>
                <div className={clsx('text-lg font-bold tabular-nums', calc.isGoodRR ? 'text-brand-400' : 'text-amber-400')}>
                  1:{calc.rr}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">Reward</div>
                <div className="text-lg font-bold text-brand-400 tabular-nums">${calc.potentialProfit}</div>
              </div>
            </div>
            {slInvalid && (
              <p className="text-xs text-amber-400 mt-2 px-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Stop loss is on the wrong side of entry for this direction — fix SL before trading live.
              </p>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-brand-500/15">
                <CalcIcon className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h2 className="font-bold text-white">
                  {mode === 'position' ? 'Trade inputs' : 'Risk inputs'}
                </h2>
                <p className="text-xs text-slate-400">Updates live — large inputs for mobile</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Account Balance (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    className="input pl-7 min-h-[52px]"
                    value={accountBalance}
                    onChange={e => setAccountBalance(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="label">Risk Per Trade</label>
                <div className="space-y-2">
                  <div className="flex gap-1.5">
                    {presetRisks.map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRiskPercent(r)}
                        className={clsx(
                          'flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all min-h-[44px]',
                          riskPercent === r
                            ? 'bg-brand-500/20 text-brand-400 border-brand-500/40 shadow-glow-sm'
                            : 'bg-dark-300 text-slate-400 border-surface-border hover:bg-surface-light'
                        )}
                      >
                        {r}%
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={riskPercent}
                      onChange={e => setRiskPercent(Number(e.target.value))}
                      className="w-full accent-brand-500 min-h-[44px]"
                    />
                    <div className="flex justify-between text-xs text-slate-600 mt-0.5">
                      <span>0.1%</span>
                      <span className="text-brand-400 font-semibold">{riskPercent}%</span>
                      <span>5%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Instrument</label>
                <select className="select min-h-[52px]" value={symbol} onChange={e => setSymbol(e.target.value)}>
                  {instruments.map(i => (
                    <option key={i.name} value={i.name}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Direction</label>
                <div
                  className={clsx(
                    'p-3 rounded-xl border text-sm font-semibold flex items-center gap-2 min-h-[52px]',
                    calc.isLong
                      ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  )}
                >
                  <TrendingUp className={clsx('w-4 h-4', !calc.isLong && 'rotate-180')} />
                  {calc.isLong ? '▲ LONG (BUY)' : '▼ SHORT (SELL)'}
                </div>
              </div>

              <div>
                <label className="label">Entry Price</label>
                <input
                  type="number"
                  step="0.0001"
                  className="input min-h-[52px]"
                  value={entryPrice}
                  onChange={e => setEntryPrice(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="label">Stop Loss</label>
                <input
                  type="number"
                  step="0.0001"
                  className={clsx('input min-h-[52px]', slInvalid && 'border-amber-500/70 ring-2 ring-amber-500/25')}
                  value={stopLoss}
                  onChange={e => setStopLoss(Number(e.target.value))}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">Take Profit</label>
                <input
                  type="number"
                  step="0.0001"
                  className="input min-h-[52px] border-brand-500/30 focus:ring-brand-500/30"
                  value={takeProfit}
                  onChange={e => setTakeProfit(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-6">
            <RiskPath
              entry={entryPrice}
              stopLoss={stopLoss}
              takeProfit={takeProfit}
              isLong={calc.isLong}
            />

            <div>
              <h3 className="font-semibold text-white mb-4">Calculation results</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                <div className="rounded-xl p-4 border border-brand-500/30 bg-brand-500/5 sm:col-span-1">
                  <div className="text-xs text-slate-500 mb-1 flex items-center justify-between gap-2">
                    Lot size
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(calc.lotSize.toString());
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="p-1.5 rounded hover:bg-surface-border text-slate-400 hover:text-white transition-colors"
                      title="Copy lot size"
                    >
                      {copied ? <Check className="w-4 h-4 text-brand-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="text-xl font-bold text-white">{calc.lotSize} lots</div>
                </div>
                {[
                  { label: 'Risk amount', value: `$${calc.riskAmount}`, color: 'text-red-400' },
                  { label: 'Potential profit', value: `$${calc.potentialProfit}`, color: 'text-brand-400' },
                  { label: 'Risk:Reward', value: `1:${calc.rr}`, color: calc.isGoodRR ? 'text-brand-400' : 'text-amber-400' },
                  { label: 'SL pips', value: `${calc.slPips} pips`, color: 'text-red-400' },
                  { label: 'TP pips', value: `${calc.tpPips} pips`, color: 'text-brand-400' },
                ].map(r => (
                  <div key={r.label} className="bg-dark-300 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">{r.label}</div>
                    <div className={clsx('text-xl font-bold', r.color)}>{r.value}</div>
                  </div>
                ))}
              </div>

              <div
                className={clsx(
                  'p-4 rounded-xl border flex items-center gap-3',
                  calc.isGoodRR ? 'bg-brand-500/5 border-brand-500/20' : 'bg-amber-500/5 border-amber-500/20'
                )}
              >
                {calc.isGoodRR ? (
                  <CheckCircle2 className="w-5 h-5 text-brand-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                )}
                <div>
                  <p className={clsx('text-sm font-semibold', calc.isGoodRR ? 'text-brand-400' : 'text-amber-400')}>
                    {calc.isGoodRR ? 'Strong risk:reward' : 'Weak risk:reward'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {calc.isGoodRR
                      ? `At 1:${calc.rr}, ~${(100 / (1 + calc.rr)).toFixed(0)}% win rate breaks even.`
                      : `Target at least 1:2 R:R for sustainable edge.`}
                  </p>
                </div>
              </div>

              {mode === 'risk' && (
                <div className="rounded-xl border border-surface-border bg-dark-300/50 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white mb-2">Analysis mode</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Use this view to sanity-check distance to stop vs target. Pair the risk path above with your session
                    rules — never widen stops emotionally after entry.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-white mb-3">Risk management guidelines</h3>
            <div className="space-y-2">
              {[
                { rule: 'Risk per trade', rec: '0.5% - 2%', current: `${riskPercent}%`, ok: riskPercent <= 2 },
                { rule: 'Min R:R ratio', rec: '1:1.5 or better', current: `1:${calc.rr}`, ok: calc.rr >= 1.5 },
                { rule: 'Max daily risk', rec: '3% - 5% of account', current: `Est. ${(riskPercent * 3).toFixed(0)}%`, ok: riskPercent * 3 <= 5 },
                { rule: 'Stop placement', rec: 'Beyond structure', current: slInvalid ? 'Invalid side' : 'OK', ok: !slInvalid },
              ].map(r => (
                <div key={r.rule} className="flex items-center justify-between p-3 bg-dark-300 rounded-lg">
                  <div className="flex items-center gap-2">
                    {r.ok ? (
                      <CheckCircle2 className="w-4 h-4 text-brand-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="text-sm text-slate-300">{r.rule}</span>
                  </div>
                  <div className="text-right">
                    <div className={clsx('text-xs font-semibold', r.ok ? 'text-brand-400' : 'text-amber-400')}>{r.current}</div>
                    <div className="text-xs text-slate-600">{r.rec}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
