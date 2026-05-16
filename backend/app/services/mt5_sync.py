"""
MT5 Sync Service: Connects to MetaTrader 5 and imports trade history.
Requires MetaTrader5 Python package and a running MT5 terminal.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class MT5SyncService:
    """Handles MT5 connection and trade synchronization."""

    def __init__(self, login: int, password: str, server: str):
        self.login = login
        self.password = password
        self.server = server
        self._connected = False

    def connect(self) -> bool:
        """Initialize MT5 connection."""
        try:
            import MetaTrader5 as mt5
            if not mt5.initialize():
                logger.error("MT5 initialize() failed")
                return False
            if not mt5.login(self.login, password=self.password, server=self.server):
                logger.error("MT5 login failed: %s", mt5.last_error())
                mt5.shutdown()
                return False
            self._connected = True
            logger.info("MT5 connected: %s", mt5.account_info().name)
            return True
        except ImportError:
            logger.warning("MetaTrader5 package not installed.")
            return False
        except Exception as e:
            logger.error("MT5 connection error: %s", e)
            return False

    def get_account_info(self) -> Optional[Dict[str, Any]]:
        """Get account balance and equity."""
        try:
            import MetaTrader5 as mt5
            info = mt5.account_info()
            if info is None:
                return None
            return {
                "balance": info.balance,
                "equity": info.equity,
                "margin": info.margin,
                "free_margin": info.margin_free,
                "currency": info.currency,
                "name": info.name,
                "server": info.server,
                "leverage": info.leverage,
            }
        except Exception as e:
            logger.error("Get account info error: %s", e)
            return None

    def fetch_trades(
        self,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """Fetch closed trades from MT5 history (empty if not connected)."""
        if not self._connected:
            return []

        try:
            import MetaTrader5 as mt5
            from_dt = from_date or (datetime.now() - timedelta(days=90))
            to_dt = to_date or datetime.now()

            deals = mt5.history_deals_get(from_dt, to_dt)
            if deals is None:
                return []

            trades = []
            open_trades: Dict[int, Dict] = {}

            for deal in deals:
                if deal.type in (0, 1):  # BUY or SELL
                    ticket = deal.position_id
                    if deal.entry == 0:  # ENTRY
                        open_trades[ticket] = {
                            "ticket": str(ticket),
                            "symbol": deal.symbol,
                            "direction": "BUY" if deal.type == 0 else "SELL",
                            "entry_price": deal.price,
                            "lot_size": deal.volume,
                            "entry_time": datetime.fromtimestamp(deal.time).isoformat(),
                            "commission": deal.commission,
                        }
                    elif deal.entry == 1 and ticket in open_trades:  # EXIT
                        trade = open_trades.pop(ticket)
                        pnl = deal.profit
                        exit_time = datetime.fromtimestamp(deal.time)
                        entry_time = datetime.fromisoformat(trade["entry_time"])
                        duration = int((exit_time - entry_time).total_seconds() / 60)

                        trades.append({
                            **trade,
                            "exit_price": deal.price,
                            "exit_time": exit_time.isoformat(),
                            "pnl": pnl + deal.commission + deal.swap,
                            "commission": trade["commission"] + deal.commission,
                            "swap": deal.swap,
                            "status": "WIN" if pnl > 0 else "LOSS" if pnl < 0 else "BREAKEVEN",
                            "duration": duration,
                            "mt5_ticket": str(ticket),
                        })

            return trades

        except Exception as e:
            logger.error("Fetch trades error: %s", e)
            return []

    def disconnect(self):
        """Shutdown MT5 connection."""
        try:
            import MetaTrader5 as mt5
            mt5.shutdown()
            self._connected = False
        except Exception:
            pass

    @staticmethod
    def demo_sample_trades() -> List[Dict[str, Any]]:
        """Explicit demo payload — only used when sync route allows demo fallback."""
        return [
            {
                "ticket": "demo-001", "symbol": "XAUUSD", "direction": "BUY",
                "entry_price": 2350.50, "exit_price": 2362.30, "lot_size": 0.5,
                "entry_time": (datetime.now() - timedelta(hours=3)).isoformat(),
                "exit_time": datetime.now().isoformat(),
                "pnl": 590.0, "commission": -3.5, "swap": 0.0,
                "status": "WIN", "duration": 180, "mt5_ticket": "demo-001",
            },
        ]
