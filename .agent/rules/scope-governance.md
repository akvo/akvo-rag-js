---
trigger: always_on
description: Scope Governance Protocol — enforces pre-execution scope boundaries, blast-radius audits, and the Change Quarantine Principle to eliminate out-of-scope code drift and regressions.
---

# Scope Governance & Change Quarantine Protocol 🛡️

## Purpose
In multi-agent and autonomous development, subagents frequently exhibit **speculative scope expansion** (e.g. unsolicited refactoring of adjacent legacy files, premature abstractions, rewriting untouched documentation). This protocol establishes hard boundary guardrails to keep changes localized, predictable, and regression-free.

---

## 1. Pre-Execution Scope Lock 🔒

Before writing or modifying any code in a task:
1. **Explicit Touchpoint Declaration**: The agent must declare exact in-scope and out-of-scope boundaries:
   ```markdown
   ### 🎯 Scope Boundary Declaration
   - **In-Scope Targets**:
     - `[CREATE]` `backend/app/services/auth_service.py`
     - `[MODIFY]` `backend/app/api/v1/auth.py` (only lines relevant to login handler)
     - `[TEST]` `backend/tests/test_auth_service.py`
   - **Explicitly Out-of-Scope**:
     - Upstream User Model refactoring
     - General database session manager refactoring
     - Unrelated UI/README modifications
   ```
2. **Blast Radius Limit**: Changes MUST be constrained strictly to the declared touchpoints. Any modification to a file outside the touchpoint list requires explicit escalation or quarantine.

---

## 2. The Change Quarantine Principle 📦

During development, agents often discover secondary bugs, tangential technical debt, or potential optimization opportunities in adjacent files.

### 🚫 The Hard Rule: NEVER Refactor In-Flight
- Agents **MUST NOT** opportunistically modify, refactor, or "clean up" adjacent code that is outside the active task's acceptance criteria.
- Doing so inflates diff sizes, complicates code review, and introduces hidden regressions.

### ✅ The Quarantine Protocol:
When a tangential problem or improvement is identified:
1. **Quarantine the Finding**: Document the observation without touching the code.
2. **Log a Backlog Issue**: Create a concise tracking issue (via GitHub Issue or task backlog) containing:
   - Affected file(s) and lines.
   - Observed anti-pattern or bug.
   - Proposed future refactoring/fix.
3. **Continue In-Scope Task**: Resume the primary task without expanding the current diff.

---

## 3. Blast-Radius Review Audit (`[SCOPE]` Gate) 🔍

During code review (`bmad-reviewer` / `Rachel`):
1. **Diff Boundary Check**: The reviewer compares the `git diff --name-only` against the declared touchpoint list.
2. **Flag Violations**: Any diff chunk in an unapproved file or unapproved function triggers a `[SCOPE]` rejection.
3. **Rollback Mandate**: The developer agent MUST revert out-of-scope changes and quarantine them before the PR can be approved.

---

## 4. DOs and DONTs Summary

| Category | DO | DON'T |
|---|---|---|
| **Task Boundaries** | Stick strictly to the task acceptance criteria. | Touch legacy files to "improve style" or "modernize syntax". |
| **Tangential Debt** | Log a separate GitHub issue for newly discovered debt. | Fix unrelated bugs inside an active feature PR. |
| **Formatting** | Format only modified lines/blocks. | Run whole-file formatters that produce 500-line whitespace diffs. |
| **Tool Operations** | Use targeted `replace_file_content` chunks. | Overwrite whole files for localized 5-line edits. |
