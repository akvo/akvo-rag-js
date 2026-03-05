# Story: STORY-TEST-01 - Test Suite Migration
**Status: Implemented**


**As a** developer
**I want** to move verification scripts into a formal `tests/` directory and run them via `npm test`
**So that** I can ensure code quality consistently and easily.

### Timeline & Effort
- **Estimated Time**: 2h
- **Actual Time**: 3h (Assistant Aided)

- **Effort Points**: 2

### Acceptance Criteria
#### User Acceptance Criteria (UAC)
- [x] `npm test` runs all unit and integration tests.
- [x] Test results are clearly displayed in the console.

#### Technical Acceptance Criteria (TAC)
- [x] Create `/tests/unit` and `/tests/integration`.
- [x] Migrate `text-cleaner.js` tests to `tests/unit/text-cleaner.test.js`.
- [x] Migrate `markdown-rendering.js` tests to `tests/integration/markdown-rendering.test.js`.
- [x] Add `"test": "node --test tests/**/*.test.js"` to `package.json`.
- [x] Ensure `src/` files use `module.exports` or similar to be testable in Node.


### Definition of Done
- [x] `npm test` passes all checks.
- [x] Scripts in `/tmp/` are no longer needed.
- [x] README updated with test instructions.

