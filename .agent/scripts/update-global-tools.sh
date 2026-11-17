#!/usr/bin/env bash
# ============================================================================
# update-global-tools.sh — Global AI Engineering Tools Updater
# ============================================================================
# Checks and updates global AI agent tools (Playwright, Context7, Strix, 9Router)
# to their latest upstream releases.
#
# Usage:
#   ./update-global-tools.sh
# ============================================================================

set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║       🔄 Upgrading Global AI Agent Tools         ║${NC}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Update Playwright CLI & Browsers
echo -e "${BLUE}Updating Playwright CLI & Browser Binaries...${NC}"
npm install -g playwright@latest
npx playwright install chromium
PLAYWRIGHT_VER=$(playwright --version 2>/dev/null || echo "installed")
echo -e "${GREEN}✅ Playwright updated:${NC} ${PLAYWRIGHT_VER}"
echo ""

# 2. Update Context7 CLI
echo -e "${BLUE}Updating Context7 CLI (ctx7)...${NC}"
npm install -g ctx7@latest
CTX7_VER=$(ctx7 --version 2>/dev/null || echo "installed")
echo -e "${GREEN}✅ Context7 updated:${NC} v${CTX7_VER}"
echo ""

# 3. Update Strix Security Scanner
echo -e "${BLUE}Updating Strix Security Scanner...${NC}"
if command -v uv >/dev/null 2>&1; then
    uv tool upgrade strix-agent || uv tool install --upgrade strix-agent
elif command -v strix >/dev/null 2>&1; then
    strix --update || echo "Self-update attempted"
fi
STRIX_VER=$(strix -v 2>/dev/null || "${HOME}/.local/bin/strix" -v 2>/dev/null || echo "installed")
echo -e "${GREEN}✅ Strix Security updated:${NC} ${STRIX_VER}"
echo ""

# 4. Update 9Router Gateway
if command -v 9r >/dev/null 2>&1 || npm list -g 9router >/dev/null 2>&1; then
    echo -e "${BLUE}Updating 9Router Gateway...${NC}"
    npm install -g 9router@latest
    ROUTER_VER=$(9r version 2>/dev/null || npm list -g 9router --depth=0 2>/dev/null | grep 9router | tr -d ' ' || echo "installed")
    echo -e "${GREEN}✅ 9Router updated:${NC} ${ROUTER_VER}"
    echo ""
fi

echo -e "${GREEN}${BOLD}All global AI engineering tools successfully updated!${NC}"
echo ""
