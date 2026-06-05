import { computeMetrics } from '../src/lib/metricsFromTrades';
import { METRICS_PARITY_EXPECTED, METRICS_PARITY_TRADES } from '../src/lib/metricsParityFixture';

const m = computeMetrics(METRICS_PARITY_TRADES);
const checks: [string, number, number][] = [
  ['totalTrades', m.totalTrades, METRICS_PARITY_EXPECTED.totalTrades],
  ['winTrades', m.winTrades, METRICS_PARITY_EXPECTED.winTrades],
  ['lossTrades', m.lossTrades, METRICS_PARITY_EXPECTED.lossTrades],
  ['totalPnl', m.totalPnl, METRICS_PARITY_EXPECTED.totalPnl],
  ['winRate', m.winRate, METRICS_PARITY_EXPECTED.winRate],
  ['profitFactor', m.profitFactor, METRICS_PARITY_EXPECTED.profitFactor],
  ['bestTrade', m.bestTrade, METRICS_PARITY_EXPECTED.bestTrade],
  ['worstTrade', m.worstTrade, METRICS_PARITY_EXPECTED.worstTrade],
  ['tradingDays', m.tradingDays, METRICS_PARITY_EXPECTED.tradingDays],
];

let failed = false;
for (const [name, got, want] of checks) {
  if (got !== want) {
    console.error(`metrics parity FAIL ${name}: got ${got} want ${want}`);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log('metrics parity OK');
