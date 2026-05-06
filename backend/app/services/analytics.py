"""
Analytics service: computes all performance metrics from a list of trades.
"""
from typing import List, Dict, Any
from datetime import datetime, timedelta
import statistics


def compute_metrics(trades: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Compute comprehensive performance metrics from trade list."""
    if not trades:
        return _empty_metrics()

    wins = [t for t in trades if t.get("status") == "WIN"]
    losses = [t for t in trades if t.get("status") == "LOSS"]

    total_pnl = sum(t.get("pnl", 0) for t in trades)
    gross_profit = sum(t.get("pnl", 0) for t in wins) if wins else 0
    gross_loss = abs(sum(t.get("pnl", 0) for t in losses)) if losses else 0

    win_rate = len(wins) / len(trades) * 100 if trades else 0
    profit_factor = gross_profit / gross_loss if gross_loss > 0 else float("inf")

    avg_win = gross_profit / len(wins) if wins else 0
    avg_loss = -(gross_loss / len(losses)) if losses else 0

    avg_rr = sum(t.get("r_multiple", 0) for t in trades) / len(trades)

    # Equity curve and max drawdown
    equity = 10000.0
    peak = 10000.0
    max_dd = 0.0
    equity_curve = []

    sorted_trades = sorted(trades, key=lambda x: x.get("entry_time", ""))
    for t in sorted_trades:
        equity += t.get("pnl", 0)
        if equity > peak:
            peak = equity
        dd = (peak - equity) / peak * 100
        if dd > max_dd:
            max_dd = dd
        equity_curve.append({"equity": round(equity, 2), "pnl": t.get("pnl", 0)})

    # Streaks
    max_win_streak, max_loss_streak = 0, 0
    cur_win, cur_loss = 0, 0
    for t in sorted_trades:
        if t.get("status") == "WIN":
            cur_win += 1
            cur_loss = 0
            max_win_streak = max(max_win_streak, cur_win)
        else:
            cur_loss += 1
            cur_win = 0
            max_loss_streak = max(max_loss_streak, cur_loss)

    # Daily P&L
    daily_pnl: Dict[str, float] = {}
    for t in trades:
        day = t.get("entry_time", "")[:10]
        daily_pnl[day] = daily_pnl.get(day, 0) + t.get("pnl", 0)

    trading_days = len(daily_pnl)
    avg_daily_pnl = total_pnl / trading_days if trading_days else 0

    # Expectancy
    expectancy = (
        (len(wins) / len(trades) * avg_win) +
        (len(losses) / len(trades) * avg_loss)
    ) if trades else 0

    pnl_values = [t.get("pnl", 0) for t in trades]
    std_dev = statistics.stdev(pnl_values) if len(pnl_values) > 1 else 0
    sharpe = (avg_daily_pnl / std_dev * (252 ** 0.5)) if std_dev > 0 else 0

    durations = [t.get("duration", 0) for t in trades if t.get("duration")]
    avg_hold = sum(durations) / len(durations) if durations else 0

    return {
        "total_pnl": round(total_pnl, 2),
        "win_rate": round(win_rate, 1),
        "profit_factor": round(min(profit_factor, 99), 2),
        "avg_win": round(avg_win, 2),
        "avg_loss": round(avg_loss, 2),
        "avg_rr": round(avg_rr, 2),
        "max_drawdown": round(max_dd, 2),
        "total_trades": len(trades),
        "win_trades": len(wins),
        "loss_trades": len(losses),
        "breakeven_trades": len(trades) - len(wins) - len(losses),
        "best_trade": round(max(t.get("pnl", 0) for t in trades), 2),
        "worst_trade": round(min(t.get("pnl", 0) for t in trades), 2),
        "avg_hold_time": round(avg_hold, 0),
        "max_consecutive_wins": max_win_streak,
        "max_consecutive_losses": max_loss_streak,
        "sharpe_ratio": round(sharpe, 2),
        "expectancy": round(expectancy, 2),
        "avg_daily_pnl": round(avg_daily_pnl, 2),
        "trading_days": trading_days,
        "gross_profit": round(gross_profit, 2),
        "gross_loss": round(gross_loss, 2),
        "equity_curve": equity_curve,
        "daily_pnl": [{"date": k, "pnl": round(v, 2)} for k, v in sorted(daily_pnl.items())],
    }


def _empty_metrics() -> Dict[str, Any]:
    return {
        "total_pnl": 0, "win_rate": 0, "profit_factor": 0,
        "avg_win": 0, "avg_loss": 0, "avg_rr": 0, "max_drawdown": 0,
        "total_trades": 0, "win_trades": 0, "loss_trades": 0,
        "breakeven_trades": 0, "best_trade": 0, "worst_trade": 0,
        "avg_hold_time": 0, "max_consecutive_wins": 0, "max_consecutive_losses": 0,
        "sharpe_ratio": 0, "expectancy": 0, "avg_daily_pnl": 0, "trading_days": 0,
        "gross_profit": 0, "gross_loss": 0, "equity_curve": [], "daily_pnl": [],
    }


def compute_symbol_stats(trades: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Group trades by symbol and compute per-symbol stats."""
    symbols: Dict[str, List] = {}
    for t in trades:
        sym = t.get("symbol", "UNKNOWN")
        if sym not in symbols:
            symbols[sym] = []
        symbols[sym].append(t)

    result = []
    for sym, sym_trades in symbols.items():
        wins = [t for t in sym_trades if t.get("status") == "WIN"]
        pnl = sum(t.get("pnl", 0) for t in sym_trades)
        result.append({
            "symbol": sym,
            "trades": len(sym_trades),
            "win_rate": round(len(wins) / len(sym_trades) * 100, 1),
            "pnl": round(pnl, 2),
            "avg_rr": round(sum(t.get("r_multiple", 0) for t in sym_trades) / len(sym_trades), 2),
        })

    return sorted(result, key=lambda x: x["pnl"], reverse=True)


def compute_session_stats(trades: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Compute performance breakdown by trading session."""
    sessions: Dict[str, Dict] = {}
    for t in trades:
        session = t.get("session", "Unknown")
        if session not in sessions:
            sessions[session] = {"wins": 0, "losses": 0, "pnl": 0, "trades": 0}
        s = sessions[session]
        s["trades"] += 1
        s["pnl"] += t.get("pnl", 0)
        if t.get("status") == "WIN":
            s["wins"] += 1
        else:
            s["losses"] += 1

    return {
        session: {
            **data,
            "win_rate": round(data["wins"] / data["trades"] * 100, 1) if data["trades"] else 0,
            "pnl": round(data["pnl"], 2),
        }
        for session, data in sessions.items()
    }


def compute_psychology_stats(trades: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Analyze performance by emotional state."""
    emotions: Dict[str, Dict] = {}
    for t in trades:
        emotion = t.get("emotion", "Neutral")
        if emotion not in emotions:
            emotions[emotion] = {"wins": 0, "total": 0, "pnl": 0}
        e = emotions[emotion]
        e["total"] += 1
        e["pnl"] += t.get("pnl", 0)
        if t.get("status") == "WIN":
            e["wins"] += 1

    return sorted([
        {
            "emotion": emotion,
            "win_rate": round(data["wins"] / data["total"] * 100, 1),
            "trades": data["total"],
            "pnl": round(data["pnl"], 2),
        }
        for emotion, data in emotions.items()
    ], key=lambda x: x["win_rate"], reverse=True)
