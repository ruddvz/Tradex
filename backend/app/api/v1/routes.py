"""
FastAPI v1 API — aggregates domain routers under /api/v1.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/api/v1")

from .auth_api import router as auth_router
from .accounts_api import router as accounts_router
from .paper_legacy_api import router as paper_legacy_router
from .ai_api import router as ai_router
from .notebook_api import router as notebook_router
from .challenges_api import router as challenges_router
from .settings_api import router as settings_router
from .sync_api import router as sync_router
from .trades_api import router as trades_router
from .analytics_api import router as analytics_router

router.include_router(auth_router)
router.include_router(accounts_router)
router.include_router(paper_legacy_router)
router.include_router(ai_router)
router.include_router(notebook_router)
router.include_router(challenges_router)
router.include_router(settings_router)
router.include_router(sync_router)
router.include_router(trades_router)
router.include_router(analytics_router)

from .manual_tasks import router as manual_tasks_router

router.include_router(manual_tasks_router, prefix="/manual-tasks", tags=["manual-tasks"])

from .setup import router as setup_router

router.include_router(setup_router, prefix="/setup", tags=["setup"])

from .paper_accounts import router as paper_accounts_router

router.include_router(paper_accounts_router, prefix="/paper-accounts", tags=["paper-accounts"])

from .paper_execution import router as paper_execution_router

router.include_router(paper_execution_router)

from .risk import router as risk_router

router.include_router(risk_router)

from .bot import router as bot_router

router.include_router(bot_router)

from .backtests import router as backtests_router

router.include_router(backtests_router)

from .strategy_runs import router as strategy_runs_router

router.include_router(strategy_runs_router)

from .live_readiness import router as live_readiness_router

router.include_router(live_readiness_router)
