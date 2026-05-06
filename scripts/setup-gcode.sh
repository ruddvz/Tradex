#!/usr/bin/env bash
# setup-gcode.sh — Install the gcode agent harness for this workspace.
#
# Usage:
#   bash scripts/setup-gcode.sh           # install / update
#   bash scripts/setup-gcode.sh --force   # reinstall even if up to date
#
# Environment variables:
#   GCODE_INSTALL_DIR  — override install location (default: ~/.local/bin)
#   GCODE_SRC_DIR      — override source clone location (default: ~/.gcode/src)
#   ANTHROPIC_API_KEY  — if set, Claude works immediately without a login step
set -euo pipefail

REPO="bitan-del/gcode-harness"
INSTALL_DIR="${GCODE_INSTALL_DIR:-$HOME/.local/bin}"
SRC_DIR="${GCODE_SRC_DIR:-$HOME/.gcode/src}"
BUILD_LOG="$HOME/.gcode/build.log"
FORCE="${1:-}"

info()  { printf '\033[1;34m[gcode] %s\033[0m\n' "$*"; }
ok()    { printf '\033[1;32m[gcode] ✅ %s\033[0m\n' "$*"; }
warn()  { printf '\033[1;33m[gcode] ⚠  %s\033[0m\n' "$*"; }
err()   { printf '\033[1;31m[gcode] ✗  %s\033[0m\n' "$*" >&2; exit 1; }

# ── already installed? ────────────────────────────────────────────────────────
LAUNCHER="$INSTALL_DIR/gcode"
if [ -x "$LAUNCHER" ] && [ "$FORCE" != "--force" ]; then
  CURRENT=$("$LAUNCHER" --version 2>/dev/null | head -1 || echo "unknown")
  ok "gcode already installed: $CURRENT"
  info "Use --force to reinstall."
  exit 0
fi

# ── pre-flight checks ─────────────────────────────────────────────────────────
command -v git   >/dev/null 2>&1 || err "git is required"
command -v cargo >/dev/null 2>&1 || {
  warn "cargo not found — installing Rust via rustup…"
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --no-modify-path
  source "$HOME/.cargo/env"
}

# gcode requires edition 2024 — needs Rust ≥1.85
RUST_VERSION=$(rustc --version 2>/dev/null | awk '{print $2}' || echo "0.0.0")
RUST_MINOR=$(echo "$RUST_VERSION" | cut -d. -f2)
if [ "$(echo "$RUST_VERSION" | cut -d. -f1)" -lt 1 ] || [ "$RUST_MINOR" -lt 85 ]; then
  info "Rust $RUST_VERSION detected — upgrading to stable (≥1.85 required)…"
  rustup toolchain install stable --no-self-update
  rustup default stable
fi

# OpenSSL dev headers (required by reqwest on Linux)
if command -v pkg-config >/dev/null 2>&1 && ! pkg-config --exists openssl 2>/dev/null; then
  if command -v apt-get >/dev/null 2>&1; then
    info "Installing libssl-dev…"
    apt-get update -qq && apt-get install -y -qq pkg-config libssl-dev
  else
    warn "OpenSSL dev headers may be missing — install pkg-config + libssl-dev for your OS."
  fi
fi

# ── clone / update source ─────────────────────────────────────────────────────
mkdir -p "$SRC_DIR"
if [ -d "$SRC_DIR/.git" ]; then
  info "Updating gcode source…"
  git -C "$SRC_DIR" fetch --quiet origin master
  git -C "$SRC_DIR" reset --hard origin/master
else
  info "Cloning gcode harness…"
  git clone --depth 1 "https://github.com/$REPO.git" "$SRC_DIR"
fi

# ── build ─────────────────────────────────────────────────────────────────────
mkdir -p "$(dirname "$BUILD_LOG")"
info "Building gcode release binary (first run takes ~5 min, subsequent runs are instant)…"
info "Build log: $BUILD_LOG"

cargo build --release --bin gcode --bin gcode-harness --manifest-path "$SRC_DIR/Cargo.toml" 2>&1 | tee "$BUILD_LOG"

BUILT_BIN="$SRC_DIR/target/release/gcode"
[ -f "$BUILT_BIN" ] || err "Build finished but binary not found at $BUILT_BIN"

# ── install binaries ──────────────────────────────────────────────────────────
mkdir -p "$INSTALL_DIR"
cp -f "$BUILT_BIN" "$LAUNCHER"
chmod +x "$LAUNCHER"

# Also install the smoke-test harness binary
HARNESS_BIN="$SRC_DIR/target/release/gcode-harness"
if [ -f "$HARNESS_BIN" ]; then
  cp -f "$HARNESS_BIN" "$INSTALL_DIR/gcode-harness"
  chmod +x "$INSTALL_DIR/gcode-harness"
fi

# ── add to PATH in shell init files ──────────────────────────────────────────
PATH_EXPORT="export PATH=\"$INSTALL_DIR:\$PATH\""
for RC in "$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.profile" "$HOME/.zshenv"; do
  if [ -f "$RC" ] && ! grep -qF "$INSTALL_DIR" "$RC" 2>/dev/null; then
    printf '\n# Added by gcode installer\n%s\n' "$PATH_EXPORT" >> "$RC"
    info "PATH entry added to $RC"
  fi
done
export PATH="$INSTALL_DIR:$PATH"

# ── write default config if absent ───────────────────────────────────────────
CONFIG_FILE="$HOME/.gcode/config.toml"
if [ ! -f "$CONFIG_FILE" ]; then
  mkdir -p "$(dirname "$CONFIG_FILE")"
  cat > "$CONFIG_FILE" <<'EOF'
[provider]
default_provider = "claude"

[display]
diff_mode = "inline"
prompt_preview = true

[feature]
memory = true
swarm = true

[compaction]
mode = "proactive"
EOF
  info "Default config written to $CONFIG_FILE"
fi

# ── done ──────────────────────────────────────────────────────────────────────
echo ""
GCODE_VER=$("$LAUNCHER" --version 2>/dev/null | head -1 || echo "?")
ok "gcode installed: $GCODE_VER → $LAUNCHER"
echo ""
info "Quick start (from any project directory):"
echo "    cd /workspace && gcode"
echo ""
info "Provider setup (pick one):"
echo ""
echo "  Option A — Anthropic API key (instant, no login needed):"
echo "    export ANTHROPIC_API_KEY=sk-ant-..."
echo "    gcode run 'hello'"
echo ""
echo "  Option B — Claude Max / OAuth login:"
echo "    gcode login --provider claude"
echo ""
echo "  Option C — GitHub Copilot:"
echo "    gcode login --provider copilot"
echo ""
echo "  Option D — OpenRouter (pay-per-token, 200+ models):"
echo "    gcode login --provider openrouter"
echo ""
info "Add ANTHROPIC_API_KEY to Cursor Secrets for persistent cloud agent access."
echo ""
info "Smoke test the tool harness (no API key required):"
echo "    gcode-harness"
