# ADR-005: Exponential Backoff for WebSocket

- **Status**: Proposed
- **Context**: The current WebSocket implementation uses a fixed 3-second reconnection delay. This can create a "thundering herd" problem if many clients reconnect simultaneously after a backend outage.
- **Decision**: Implement exponential backoff with jitter for reconnection attempts. The delay will follow the formula: `min(initialDelay * 2^attempt + jitter, maxDelay)`.
- **Alternatives Considered**:
    - *Linear Backoff*: Currently in use, rejected for lack of resilience.
- **Consequences**:
    - **Pros**: Reduces load on the backend during recovery; more professional/premium implementation.
    - **Cons**: Slightly more complex logic in `websocket.js`.
