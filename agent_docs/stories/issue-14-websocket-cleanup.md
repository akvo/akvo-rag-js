# Story #14: WebSocket Stability & Chatbot Code Cleanup

## Metadata
- **Epic**: Chat Widget Reliability
- **Type**: Maintenance / Refactor
- **Status**: Done
- **Estimated Effort**: 1
- **Actual Time**: 1.5h

## Description
The WebSocket component currently lacks detailed diagnostic logging during connection failures, making it difficult for developers to troubleshoot environment issues (e.g., incorrect ports). Additionally, `src/chatbot.js` contains legacy module-level variables that shadow class instance properties.

**New Requirement**: The `release.sh` script should verify NPM authentication before proceeding to prevent failing halfway through a release.

## User Acceptance Criteria (UAC)
- [x] WebSocket connection attempts log the target URL and port clearly in the developer console.
- [x] WebSocket errors show descriptive messages helping to identify the failure cause (e.g., connection refused, timeout).
- [x] The `src/chatbot.js` file is free of redundant module-level state variables (`wsConnection`, `isLoading`, etc.).
- [x] The chat widget functionality remains fully operational after the refactor.
- [x] The `release.sh` script aborts immediately if the user is not logged into NPM.

## Technical Acceptance Criteria (TAC)
- [x] Remove shadowing variables from `src/chatbot.js`.
- [x] Update `src/lib/websocket.js` with diagnostics.
- [x] Add `npm whoami` check to `release.sh`.
- [x] Ensure `release.sh` provides a clear error message on auth failure.

## Technical Notes
- Using the `bmad-fastpath` workflow.
- Ensure no functional regressions in the streaming response logic.
