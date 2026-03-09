## Story: STORY-011: Component Pattern Refactor
## Story: STORY-011 [COMPLETED]: Component Pattern Refactor
**As a** host application developer
**I want** the Akvo RAG widget to be an instance-based component
**So that** I can manage its lifecycle, avoid global state pollution, and destroy it cleanly when needed.

### Timeline & Effort
- **Estimated Time**: 4h
- **Actual Time**: 1.5h
- **Effort Points**: 5

### Acceptance Criteria
#### User Acceptance Criteria (UAC)
- [ ] Widget functions exactly as before for the end-user.
- [ ] Multiple widgets can theoretically exist if configured with different IDs (future-proof).

#### Technical Acceptance Criteria (TAC)
- [x] `chatbot.js` exports a `Chatbot` class or equivalent.
- [x] All global variables in `chatbot.js` are moved into instance properties.
- [x] Implement a `destroy()` method that:
    - [x] Closes the WebSocket connection.
    - [x] Removes all DOM event listeners.
    - [x] Removes the `#akvo-rag` container from the DOM.
- [x] `initChat` remains as a compatibility wrapper that returns the instance.

### Technical Notes
- Follow ADR-004.
- Use `this` context or closure-scope for state.

### Definition of Done
- [ ] Unit tests passing
- [ ] Manual verification in a test page
- [ ] Code reviewed
- [ ] Documentation updated
