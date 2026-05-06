#!/usr/bin/env bash
# Claude Company OS — setup wizard
# Interactive:  bash scripts/setup.sh
# Tradex preset: bash scripts/setup.sh --preset tradex
# Re-apply env:  source scripts/presets/tradex.env && bash scripts/setup.sh --apply-only

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

usage() {
  sed -n '1,25p' "$0" | tail -n +2
  echo ""
  echo "Usage:"
  echo "  bash scripts/setup.sh                  Interactive prompts, then apply"
  echo "  bash scripts/setup.sh --preset tradex  Non-interactive Tradex (this repo)"
  echo "  bash scripts/setup.sh --apply-only     Apply from current environment (export vars first)"
  echo "  bash scripts/setup.sh --help           Show this help"
}

apply_python() {
  python3 "$ROOT/scripts/company_os_apply.py"
}

interactive() {
  echo -e "${YELLOW}Step 1/4: Company basics${NC}"
  read -r -p "Company name: " COMPANY_NAME
  read -r -p "What do you build? (one sentence): " PRODUCT_DESCRIPTION
  read -r -p "Who do you serve? (your users): " CUSTOMER_DESCRIPTION
  read -r -p "Current stage (pre-launch / live / scaling): " STAGE

  echo ""
  echo -e "${YELLOW}Step 2/4: Tech stack${NC}"
  read -r -p "Primary language(s) [TypeScript, Python]: " LANG
  LANG=${LANG:-TypeScript, Python}
  read -r -p "Frontend [React, Vite]: " FRONTEND
  FRONTEND=${FRONTEND:-React, Vite, Tailwind CSS}
  read -r -p "Backend [FastAPI]: " BACKEND
  BACKEND=${BACKEND:-FastAPI, Python}
  read -r -p "Database [PostgreSQL]: " DATABASE
  DATABASE=${DATABASE:-PostgreSQL}
  read -r -p "Auth [JWT]: " AUTH
  AUTH=${AUTH:-JWT}
  read -r -p "Hosting / infra [Docker]: " HOSTING
  HOSTING=${HOSTING:-Docker Compose}
  read -r -p "Payment provider (or 'none') [none]: " PAYMENTS
  PAYMENTS=${PAYMENTS:-none}
  read -r -p "Email provider (or 'none') [none]: " EMAIL
  EMAIL=${EMAIL:-none}
  read -r -p "Testing [pytest, eslint]: " TESTING
  TESTING=${TESTING:-pytest, ESLint}
  read -r -p "Key services (comma list) [OpenAI]: " KEY_SERVICES
  KEY_SERVICES=${KEY_SERVICES:-OpenAI}

  echo ""
  echo -e "${YELLOW}Step 3/4: Team roles (Y/n)${NC}"
  read -r -p "  Frontend team? [Y/n]: " HAS_FRONTEND
  read -r -p "  Backend team? [Y/n]: " HAS_BACKEND
  read -r -p "  Ops/DevOps team? [y/N]: " HAS_OPS
  read -r -p "  Data/ML team? [y/N]: " HAS_DATA
  HAS_FRONTEND=${HAS_FRONTEND:-Y}
  HAS_BACKEND=${HAS_BACKEND:-Y}
  HAS_OPS=${HAS_OPS:-N}
  HAS_DATA=${HAS_DATA:-N}

  echo ""
  echo -e "${YELLOW}Step 4/4: Commands${NC}"
  read -r -p "Test command [npm test]: " TEST_CMD
  TEST_CMD=${TEST_CMD:-npm test}
  read -r -p "Build command [npm run build]: " BUILD_CMD
  BUILD_CMD=${BUILD_CMD:-npm run build}
  read -r -p "Dev server command [npm run dev]: " DEV_CMD
  DEV_CMD=${DEV_CMD:-npm run dev}

  export COMPANY_OS_PRESET=""
  export COMPANY_NAME PRODUCT_DESCRIPTION CUSTOMER_DESCRIPTION STAGE
  export LANG FRONTEND BACKEND DATABASE AUTH HOSTING PAYMENTS EMAIL TESTING KEY_SERVICES
  export HAS_FRONTEND HAS_BACKEND HAS_OPS HAS_DATA
  export TEST_CMD BUILD_CMD DEV_CMD
}

case "${1:-}" in
  --help|-h)
    usage
    exit 0
    ;;
  --preset)
    if [[ "${2:-}" != "tradex" ]]; then
      echo "Unknown preset: ${2:-}. Only 'tradex' is bundled." >&2
      exit 1
    fi
    # shellcheck source=/dev/null
    source "$ROOT/scripts/presets/tradex.env"
    echo -e "${BLUE}Applying Tradex preset (non-interactive)...${NC}"
    apply_python
    ;;
  --apply-only)
    apply_python
    ;;
  "")
    echo -e "${BLUE}Claude Company OS — interactive setup${NC}"
    echo "Substitutions use Python (safe for special characters in your answers)."
    echo ""
    interactive
    echo ""
    echo -e "${YELLOW}Applying...${NC}"
    apply_python
    ;;
  *)
    echo "Unknown option: $1" >&2
    usage >&2
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}Setup complete.${NC}"
echo "Next: review .claude/skills/core/company.md and planning/ACTIVE.md, then commit."
