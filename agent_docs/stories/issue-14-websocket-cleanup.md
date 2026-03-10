# Story #14: WebSocket Stability & Chatbot Code Cleanup

## Metadata
- **Epic**: Chat Widget Reliability
- **Type**: Maintenance / Refactor
- **Status**: Done
- **Estimated Effort**: 1
- **Actual Time**: ~15m

## Description
The WebSocket component currently lacks detailed diagnostic logging during connection failures, making it difficult for developers to troubleshoot environment issues (e.g., incorrect ports). Additionally, `src/chatbot.js` contains legacy module-level variables that shadow class instance properties, which violates clean code principles and increases the risk of bugs.

## User Acceptance Criteria (UAC)
- [x] WebSocket connection attempts log the target URL and port clearly in the developer console.
- [x] WebSocket errors show descriptive messages helping to identify the failure cause (e.g., connection refused, timeout).
- [x] The `src/chatbot.js` file is free of redundant module-level state variables (`wsConnection`, `isLoading`, etc.).
- [x] The chat widget functionality (initialization, sending messages, receiving responses) remains fully operational after the refactor.

## Technical Acceptance Criteria (TAC)
- [x] Remove `let wsConnection = null;`, `let currentAssistantMsgEl = null;`, `let isLoading = false;`, `let citations = [];`, `let messageCounter = 0;`, `let chatHistory = [];` from `src/chatbot.js`.
- [x] Update `src/lib/websocket.js` to log `options.wsURL` inside `createSocket`.
- [x] Update `src/lib/websocket.js` `onerror` to provide more context if available.
- [x] Ensure `requestAnimationFrame` and other async operations correctly reference `this` context within the class.

## Technical Notes
- Using the `bmad-fastpath` workflow.
- Ensure no functional regressions in the streaming response logic.
