# Story #16: Node 20+ WebCrypto Compatibility in Unit Tests

## Metadata
- **Epic**: Test Suite Stability & Modern Node Compatibility
- **Type**: Bug Fix / Test Infrastructure
- **Status**: Done
- **Estimated Effort**: 0.5
- **Estimated Time**: 20m (Dev: 10m, Testing: 5m, QA: 5m)
- **Actual Time**: 10m

## Description
When running `npm test` on Node.js v20.20.1+, `tests/unit/chatbot.test.mjs` fails at line 10 with:
```
TypeError: Cannot set property crypto of #<Object> which has only a getter
```
In Node.js v18 and v20+, `globalThis.crypto` is a read-only getter providing the native Web Crypto API (`globalThis.crypto.randomUUID()` is natively available). Directly assigning `globalThis.crypto = { ... }` causes an unhandled TypeError.

## User Acceptance Criteria (UAC)
- [x] Running `npm test` on Node.js v18+ and v20+ passes 100% of tests without any TypeError.
- [x] Test isolation and mocks for `localStorage`, `document`, and `WebSocket` remain intact.

## Technical Acceptance Criteria (TAC)
- [x] Safely mock or polyfill `globalThis.crypto` in `tests/unit/chatbot.test.mjs`:
  - If `globalThis.crypto` already exists and provides `randomUUID()`, reuse or safely stub without direct assignment to `globalThis.crypto`.
  - If `crypto` is not defined or lacks `randomUUID`, configure it using `Object.defineProperty` or conditional fallback.
- [x] All tests in `tests/unit/chatbot.test.mjs` pass.
- [x] Full test suite (`npm test`) achieves 100% pass rate (27/27 tests passing).

## Definition of Done
- [x] `tests/unit/chatbot.test.mjs` updated with non-destructive WebCrypto stubbing.
- [x] `npm test` runs with 0 failures.
- [x] Story documented and sprint/task status updated.
