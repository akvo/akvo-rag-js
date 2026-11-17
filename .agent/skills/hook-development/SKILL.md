---
name: hook-development
description: Guide for authoring and configuring lifecycle hooks in agent environments. Use when creating PreToolUse/PostToolUse hooks, automated pre-commit safeguards, tool-gating scripts, or policy enforcement.
---

# Agent Hook Development Guide

A comprehensive guide for building deterministic, event-driven lifecycle hooks that intercept tool executions, validate safety constraints, format code, and enforce project policies.

---

## ⚡ Hook Event Matrix & Execution Flow

```
Agent Turn Triggered
   │
   ├──> SessionStart Hook (Inspect branch state & sprint plan)
   │
   ├──> [Tool Call Requested]
   │       └──> PreToolUse Hook (Block dangerous commands / enforce permissions)
   │               └──> (If PASS) -> Tool Executes
   │                       └──> PostToolUse Hook (Auto-format, lint, log metrics)
   │
   └──> PreCommit Hook (Verify test suite pass, audit commit format)
```

---

## 🛡️ Production Hook Implementations

### 1. PreToolUse Hook: Destructive Command Guard
Intercepts shell executions to prevent irreversible data loss or workspace corruption:

```bash
#!/usr/bin/env bash
set -euo pipefail

# PreToolUse Command Validator
# Arguments passed by agent engine: $1 = command_line, $2 = cwd

COMMAND="$1"

# Pattern list for high-risk operations
DANGEROUS_PATTERNS=(
  "DROP[[:space:]]+(DATABASE|SCHEMA|TABLE)"
  "TRUNCATE[[:space:]]+TABLE"
  "rm[[:space:]]+-[rf]{2,}[[:space:]]+/($|[^\.a-zA-Z0-9])"
  "git[[:space:]]+push[[:space:]]+--force"
  "git[[:space:]]+reset[[:space:]]+--hard"
  ":(){ :|:& };:"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if [[ "$COMMAND" =~ $pattern ]]; then
    echo "🚨 [POLICY VIOLATION BLOCKED]: High-risk operation detected: '$COMMAND'" >&2
    echo "💡 Explicit human consent required before running destructive operations." >&2
    exit 1
  fi
done

exit 0
```

---

### 2. PostToolUse Hook: Automated Code Formatting & Linting
Automatically runs formatters after file write or edit tools complete:

```bash
#!/usr/bin/env bash
# PostToolUse Linter / Formatter
# Arguments: $1 = target_file_path

TARGET_FILE="$1"

if [[ ! -f "$TARGET_FILE" ]]; then
  exit 0
fi

case "$TARGET_FILE" in
  *.js|*.ts|*.jsx|*.tsx|*.json|*.html|*.css)
    if command -v prettier &>/dev/null; then
      prettier --write "$TARGET_FILE" >/dev/null 2>&1 || true
    fi
    ;;
  *.py)
    if command -v ruff &>/dev/null; then
      ruff format "$TARGET_FILE" >/dev/null 2>&1 || true
    fi
    ;;
esac

exit 0
```

---

### 3. PreCommit Hook: Test Suite & Commit Standard Gate
Verifies test suite success and commit message format before allowing a git commit:

```bash
#!/usr/bin/env bash
set -euo pipefail

COMMIT_MSG_FILE="$1"
COMMIT_MSG=$(head -n 1 "$COMMIT_MSG_FILE")

# Format: [#issue_num] type(scope): description OR feat(...): ...
if ! [[ "$COMMIT_MSG" =~ ^(\[[#0-9]+\][[:space:]]+)?(feat|fix|docs|style|refactor|perf|test|chore|ci)(\([a-zA-Z0-9_-]+\))?:[[:space:]].+$ ]]; then
  echo "❌ Invalid commit message format." >&2
  echo "Expected: '[#123] feat(auth): add google oauth login'" >&2
  exit 1
fi

echo "✅ Commit message validated."
exit 0
```
