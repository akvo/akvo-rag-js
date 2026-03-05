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
- **Tooling**: Node.js (current verification), ideally Jest/Vitest in the future.

### 2. Integration Tests (Communication Layer)
- **Target**: `websocket.js` and message handlers in `chatbot.js`.
- **Focus**: Successful message flow, chunk processing, and error handling.
- **Tooling**: Simulated WebSocket server or mock WebSocket client.

### 3. Manual Verification (E2E)
- **Target**: Full widget performance in a real browser (`public/index.html`).
- **Focus**: UX of streaming, citation popovers, and overall responsiveness.

## Quality Gates
| Gate | Criteria | Blocking? |
|------|----------|-----------|
| Unit Tests | Verification script passes 100% | Yes |
| Build | `npm run build` completes without errors | Yes |
| Manual Review | Visual check of "living income" and "alleviation" cases | Yes |

## Test Strategy for Issue #10
Specifically for this issue, we use a **Verification Script** to simulate various chunking scenarios and verify that the resulting text is correctly cleaned and formatted.
