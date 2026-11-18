#!/usr/bin/env bash
# ==============================================================================
# dc.sh — Docker Compose CLI Helper for akvo-rag-js
# Standardizes local development across macOS, Linux, and Windows (WSL/Git Bash).
# ==============================================================================

set -euo pipefail

COMPOSE_CMD="docker compose"

# Fallback for older docker-compose v1 if v2 is not installed
if ! docker compose version >/dev/null 2>&1; then
  if command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
  else
    echo "❌ Error: Neither 'docker compose' nor 'docker-compose' was found."
    echo "Please install Docker Desktop or Docker Engine."
    exit 1
  fi
fi

usage() {
  cat <<EOF
akvo-rag-js Docker Helper CLI

Usage: ./dc.sh [command] [options]

Commands:
  up          Start the development server with live HMR (http://localhost:8080)
  down        Stop and remove containers
  test        Run native test suite inside the Linux container
  build       Build production assets (dist/akvo-rag.js and dist/akvo-rag.css)
  rebuild     Rebuild container image from scratch (--no-cache)
  logs        Follow container output logs
  shell       Open an interactive shell inside the container
  help        Show this help message

Examples:
  ./dc.sh up
  ./dc.sh test
  ./dc.sh build
  ./dc.sh run --rm app npm run test:coverage

Any other arguments are passed directly to '${COMPOSE_CMD}'.
EOF
}

COMMAND="${1:-up}"

case "${COMMAND}" in
  up)
    shift || true
    echo "🚀 Starting akvo-rag-js development server on http://localhost:8080..."
    ${COMPOSE_CMD} up "$@"
    ;;
  down)
    shift || true
    echo "🛑 Stopping akvo-rag-js containers..."
    ${COMPOSE_CMD} down "$@"
    ;;
  test)
    shift || true
    echo "🧪 Running test suite inside container..."
    ${COMPOSE_CMD} run --rm app npm test "$@"
    ;;
  build)
    shift || true
    echo "📦 Building production bundle inside container..."
    ${COMPOSE_CMD} run --rm app npm run build "$@"
    ;;
  rebuild)
    shift || true
    echo "🔄 Rebuilding container image..."
    ${COMPOSE_CMD} build --no-cache "$@"
    ;;
  logs)
    shift || true
    ${COMPOSE_CMD} logs -f "$@"
    ;;
  shell|sh|bash)
    shift || true
    ${COMPOSE_CMD} run --rm -it app sh "$@"
    ;;
  help|-h|--help)
    usage
    ;;
  *)
    ${COMPOSE_CMD} "$@"
    ;;
esac
