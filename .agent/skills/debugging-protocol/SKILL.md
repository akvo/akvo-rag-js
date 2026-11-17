---
name: debugging-protocol
description: Systematic global protocol for debugging issues across any stack. Use when tests fail, builds crash, or unexpected behavior occurs.
---

# Global Autonomous Debugging Protocol 🔬

A rigorous, scientific protocol for diagnosing, isolating, and fixing bugs across fullstack codebases. **Never guess a fix or randomly modify code without a confirmed failing reproduction.**

---

## 🧭 The 6-Phase Diagnostic Lifecycle

```
[1. Incident Isolation] ──► [2. Root-Cause Hypothesis] ──► [3. Surgical Inspection]
                                                                    │
[6. Regression Audit]   ◄── [5. Minimal Atomic Fix]     ◄── [4. TDD Failing Test (Red)]
```

---

## Phase 1: Incident Isolation & Telemetry Gathering
1. **Service & Process Health**:
   - Check container/process state (`docker ps`, `pm2 status`, or stack dev server).
   - Check port collisions (`lsof -i :<PORT>`).
2. **Log & Trace Ingestion**:
   - Capture exact stack trace, error code, and timestamp.
   - Separate client-side network errors (e.g. 401, 404, 500) from server-side uncaught exceptions.

---

## Phase 2: Root-Cause Hypothesis (Scientific Method)
Before looking at code, formulate a falsifiable hypothesis:
- *What is the expected behavior vs. actual behavior?*
- *Is this caused by state corruption, timing/race condition, payload mismatch, or unhandled null/undefined?*
- *Did a recent dependency update or schema migration introduce breaking behavior?*

---

## Phase 3: Surgical Inspection (Zero-Guessing)
1. **Targeted Reading**:
   - Navigate directly to the failing file and function mentioned in the stack trace using `read_file`.
   - Never speculate or rewrite whole files when inspecting a 5-line logic branch.
2. **Specialized Defect Scenarios**:
   - **Async / Event-Loop Deadlocks**: Look for unawaited promises, missing `asyncio.sleep()`, or blocking sync I/O calls in asynchronous routes.
   - **Database Connection Leaks**: Check unclosed transactions, missing session `finally` blocks, or exhausted connection pool limits.
   - **State Hydration Mismatch**: In SSR/SSG (Next.js/React), check browser-only globals (`window`, `localStorage`) invoked during server render.

---

## Phase 4: TDD Reproduction (Red State)
**Every bug MUST be captured with a reproducible failing test before any production code is touched.**
1. Write a minimal unit or integration test reproducing the exact input that triggered the bug.
2. Run the test suite:
   - Python: `pytest tests/test_failing_case.py -v`
   - Node/TypeScript: `npm test -- -t "reproduce issue"`
3. Confirm the test **fails with the exact same error** observed in production logs.

---

## Phase 5: Minimal Atomic Fix (Green State)
1. Apply the most concise, surgical fix possible to make the reproduction test pass.
2. Follow **KISS** and **YAGNI**: do not introduce tangential abstractions or opportunistically refactor adjacent methods during a bugfix.
3. Re-run the reproduction test and confirm it turns **GREEN**.

---

## Phase 6: Regression Verification & Quarantine
1. Run the entire test suite across the affected module to ensure zero unintended side-effects.
2. If the bug exposed deeper architectural technical debt in adjacent files, **quarantine it** per `@scope-governance.md`—log a separate tracking issue rather than expanding the active bugfix diff.
3. Verify git diff cleanly targets only the bug touchpoints: `git status` & `git diff`.
