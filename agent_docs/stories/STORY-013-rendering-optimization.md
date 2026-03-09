## Story: STORY-013: Streaming Rendering Optimization
## Story: STORY-013: Streaming Rendering Optimization [x]
**As a** user on a low-end device
**I want** the chat responses to stream smoothly without lag
**So that** I can read the AI output in real-time without the interface freezing.

### Timeline & Effort
- **Estimated Time**: 3h
- **Actual Time**: 0.5h
- **Effort Points**: 5

### Acceptance Criteria
#### User Acceptance Criteria (UAC)
- [ ] Streaming is perceptibly faster and smoother for long messages.

#### Technical Acceptance Criteria (TAC)
- [x] Implement a throttle or "fragment-based" rendering update in `chat-renderer.js`.
- [x] Avoid re-parsing the *entire* message markdown if the previous content hasn't changed (though Markdown structure might require it, explore "Dirty" checks or partial rendering).
- [x] Ensure `DOMPurify` is still applied securely.

### Technical Notes
- Focus on B003 from Research Findings.

### Definition of Done
- [ ] No regression in markdown rendering quality
- [ ] Performance benchmark (CPU usage) during long streaming shows improvement
- [ ] Code reviewed
