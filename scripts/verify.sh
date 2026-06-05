#!/usr/bin/env bash
# Tradex verification gate — run after each phase slice.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== Backend pytest =="
cd backend
python3 -m pytest tests/ -q --tb=short

echo "== Frontend lint =="
cd "$ROOT/frontend"
npm run lint

echo "== Frontend build =="
npm run build

echo "== Service worker check =="
test -f dist/sw.js || test -f dist/sw.js.map || { ls dist/; exit 1; }
grep -q "workbox" dist/sw.js || grep -q "precache" dist/sw.js
echo "SW present: dist/sw.js"

if [ -d e2e ] && [ -f e2e/package.json ]; then
  echo "== E2E (Playwright) =="
  cd "$ROOT/e2e"
  npm ci --silent 2>/dev/null || npm install --silent
  npx playwright test --reporter=line
fi

echo "== All checks passed =="
