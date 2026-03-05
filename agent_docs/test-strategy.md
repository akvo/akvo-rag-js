# Test Strategy: akvo-rag-js

## Risk Assessment
The chat widget relies on real-time streaming data. The primary risks are:
1. **Formatting Errors**: Broken words or erratic spacing during streaming (the focus of Issue #10).
2. **WebSocket Stability**: Handling disconnections and reconnections gracefully.
3. **Markdown Logic**: Parsing errors that could lead to malformed HTML or security vulnerabilities.

## Test Pyramid

### 1. Unit Tests (Logic Layer)
- **Target**: Utility functions in `src/utils/`.
- **Focus**: `text-cleaner.js` (spacing, markers), `chat-renderer.js` (concatenation logic).
- **Tooling**: Node.js Native Test Runner (`node --test`).

### 2. Integration Tests (Communication Layer)
- **Target**: `marked` GFM rendering and critical component paths.
- **Focus**: Successful message flow, chunk processing, and GFM parsing.
- **Tooling**: `tests/integration/` using `.test.mjs`.

### 3. Manual Verification (E2E)
- **Target**: Full widget performance in a real browser (`public/index.html`).
- **Focus**: UX of streaming, citation popovers, and overall responsiveness.

## Quality Gates
| Gate | Criteria | Blocking? |
|------|----------|-----------|
| Unit Tests | `npm test` passes 100% | Yes |
| Build | `npm run build` completes without errors | Yes |
| Manual Review | Visual check of "living income" and "alleviation" cases | Yes |

## Test Execution
The test suite is integrated into the standard NPM lifecycle:
```bash
npm test
```
This runs all files matching `tests/**/*.test.mjs` using the native Node.js runner.

