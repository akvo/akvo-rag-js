## Story: STORY-012: Resilient Reconnection (Exponential Backoff)
## Story: STORY-012: Resilient Reconnection (Exponential Backoff) - Done
**As a** system administrator
**I want** the chat widget to use exponential backoff for reconnections
**So that** the backend is not overwhelmed by simultaneous connection attempts after an outage.

### Timeline & Effort
- **Estimated Time**: 2h
- **Actual Time**: 0.5h
- **Effort Points**: 3

### Acceptance Criteria
#### User Acceptance Criteria (UAC)
- [ ] Chat remains connected or reconnects gracefully after network blips.
- [ ] User sees a "Reconnecting..." status if multiple attempts are needed.

#### Technical Acceptance Criteria (TAC)
- [x] Follow ADR-005.
- [x] Update `websocket.js` to use a delay formula: `min(initialDelay * 2^attempt, maxDelay)`.
- [x] Add random jitter (+/- 500ms) to prevent synchronization.
- [x] Max delay should be capped at 30 seconds.

### Technical Notes
- Update `socket.onclose` logic in `websocket.js`.

### Definition of Done
- [ ] Unit tests for backoff logic passing
- [ ] Simulated network failure verified
- [ ] Code reviewed
