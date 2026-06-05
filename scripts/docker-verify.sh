#!/usr/bin/env bash
# Full-stack Docker verification — run locally when Docker is available.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found — skip docker-verify (run on a machine with Docker Compose)."
  exit 0
fi

if ! docker compose version >/dev/null 2>&1 && ! docker-compose version >/dev/null 2>&1; then
  echo "Docker Compose not found — skip docker-verify."
  exit 0
fi

COMPOSE="docker compose"
if ! docker compose version >/dev/null 2>&1; then
  COMPOSE="docker-compose"
fi

cleanup() {
  $COMPOSE down -v --remove-orphans 2>/dev/null || true
}
trap cleanup EXIT

echo "== Docker Compose up =="
$COMPOSE up -d --build

echo "== Waiting for API health =="
for i in $(seq 1 60); do
  if curl -sf http://localhost:8000/api/v1/health >/dev/null 2>&1; then
    echo "API healthy after ${i}s"
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "API health check timed out"
    $COMPOSE logs
    exit 1
  fi
  sleep 2
done

echo "== Frontend reachable =="
curl -sf http://localhost/ >/dev/null || { echo "Frontend not reachable on :80"; exit 1; }

echo "== Docker stack verification passed =="
