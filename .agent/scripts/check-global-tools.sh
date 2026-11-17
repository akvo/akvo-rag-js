#!/usr/bin/env bash
# ============================================================================
# check-global-tools.sh — Global AI Engineering Tools & Runtime Verifier
# ============================================================================
# Checks whether global CLI tools (Playwright, Context7, Strix) and their
# supporting runtimes/browsers are installed, reporting their versions.
#
# Usage:
#   ./check-global-tools.sh [--quiet]
# ============================================================================

set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

QUIET=false
if [[ "${1:-}" == "--quiet" || "${1:-}" == "-q" ]]; then
    QUIET=true
fi

all_ready=true

if [[ "$QUIET" == false ]]; then
    echo -e "${BOLD}Checking Global Engineering & Security Tools...${NC}"
    echo ""
fi

# 1. Playwright CLI
if command -v playwright >/dev/null 2>&1; then
    PLAYWRIGHT_VER=$(playwright --version 2>/dev/null || echo "detected")
    [[ "$QUIET" == false ]] && echo -e "  ${GREEN}✅ Playwright CLI:${NC} ${PLAYWRIGHT_VER} (Global)"
elif npx playwright --version >/dev/null 2>&1; then
    PLAYWRIGHT_VER=$(npx playwright --version 2>/dev/null)
    [[ "$QUIET" == false ]] && echo -e "  ${YELLOW}⚠️  Playwright CLI:${NC} ${PLAYWRIGHT_VER} (via npx fallback)"
else
    [[ "$QUIET" == false ]] && echo -e "  ${RED}❌ Playwright CLI:${NC} Not installed"
    all_ready=false
fi

# 1b. Playwright Browser Binaries
MS_PLAYWRIGHT_DIR="${HOME}/Library/Caches/ms-playwright"
if [[ -d "$MS_PLAYWRIGHT_DIR" ]] && [[ $(find "$MS_PLAYWRIGHT_DIR" -maxdepth 1 -type d | wc -l) -gt 1 ]]; then
    BROWSERS=$(ls "$MS_PLAYWRIGHT_DIR" | grep -E "chromium|firefox|webkit" | tr '\n' ' ')
    [[ "$QUIET" == false ]] && echo -e "  ${GREEN}✅ Playwright Browsers:${NC} Global cache found (${BROWSERS})"
else
    [[ "$QUIET" == false ]] && echo -e "  ${YELLOW}⚠️  Playwright Browsers:${NC} Cache missing. Run: npx playwright install chromium"
fi

# 2. Context7 CLI
if command -v ctx7 >/dev/null 2>&1; then
    CTX7_VER=$(ctx7 --version 2>/dev/null || echo "detected")
    [[ "$QUIET" == false ]] && echo -e "  ${GREEN}✅ Context7 CLI:${NC} v${CTX7_VER} (Global)"
elif npx -y ctx7 --version >/dev/null 2>&1; then
    CTX7_VER=$(npx -y ctx7 --version 2>/dev/null)
    [[ "$QUIET" == false ]] && echo -e "  ${YELLOW}⚠️  Context7 CLI:${NC} v${CTX7_VER} (via npx fallback)"
else
    [[ "$QUIET" == false ]] && echo -e "  ${RED}❌ Context7 CLI:${NC} Not installed"
    all_ready=false
fi

# 3. Strix AI Security Scanner
STRIX_BIN=""
if command -v strix >/dev/null 2>&1; then
    STRIX_BIN="strix"
elif [[ -x "${HOME}/.local/bin/strix" ]]; then
    STRIX_BIN="${HOME}/.local/bin/strix"
fi

if [[ -n "$STRIX_BIN" ]]; then
    STRIX_VER=$("$STRIX_BIN" -v 2>/dev/null || echo "detected")
    [[ "$QUIET" == false ]] && echo -e "  ${GREEN}✅ Strix Security:${NC} ${STRIX_VER} (Global: ${STRIX_BIN})"
else
    [[ "$QUIET" == false ]] && echo -e "  ${RED}❌ Strix Security:${NC} Not found in PATH or ~/.local/bin. Run: uv tool install strix-agent"
    all_ready=false
fi

# 4. 9Router AI Gateway
if command -v 9r >/dev/null 2>&1; then
    ROUTER_RUNNING=false
    if curl -s http://127.0.0.1:20128/v1/models >/dev/null 2>&1; then
        ROUTER_RUNNING=true
    fi
    if [[ "$ROUTER_RUNNING" == true ]]; then
        [[ "$QUIET" == false ]] && echo -e "  ${GREEN}✅ 9Router Gateway:${NC} Active on port 20128 (RTK Token Saver Enabled)"
    else
        [[ "$QUIET" == false ]] && echo -e "  ${YELLOW}⚠️  9Router Gateway:${NC} Installed but offline. Start via: 9r status"
    fi
elif npm list -g 9router >/dev/null 2>&1; then
    [[ "$QUIET" == false ]] && echo -e "  ${GREEN}✅ 9Router Gateway:${NC} Installed globally"
fi

if [[ "$QUIET" == false ]]; then
    echo ""
    if [[ "$all_ready" == true ]]; then
        echo -e "${GREEN}${BOLD}All global tools are ready for AI agent execution!${NC}"
    else
        echo -e "${YELLOW}Some tools are missing or running in fallback mode.${NC}"
    fi
fi

if [[ "$all_ready" == true ]]; then
    exit 0
else
    exit 1
fi
