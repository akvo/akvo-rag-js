# STORY-018: Draggable Launcher/Window & Auto-Expanding Multiline Input

- **Epic**: [CHAT-002] akvo-rag-js Package Enhancement: Draggable Launcher/Window & Auto-Expanding Multiline Input
- **Feature Spec**: `agent_docs/features/18-draggable-multiline.md`
- **GitHub Issue**: [#18](https://github.com/akvo/akvo-rag-js/issues/18)
- **Status**: Ready for Implementation

---

## Story Statement
As an end user asking in-depth questions across various websites,  
I want to be able to drag the floating launcher button and chat window to any comfortable position on my screen (and have that position remembered across reloads), and I want the input box to auto-expand as I type long multi-sentence questions,  
So that the widget never blocks underlying page content, and I can easily read, edit, and format detailed questions before sending.

---

## Acceptance Criteria
1. **Draggable Launcher with Click vs Drag Discrimination**:
   - `#akvo-rag-launcher` can be dragged via mouse or touch across the viewport.
   - Movement threshold ($\ge 6\text{px}$) distinguishes a drag from a click: dragging and releasing does NOT open the chatbox; clicking opens it.
   - Position coordinates are strictly clamped within viewport boundaries (`0 <= left <= innerWidth - width`, `0 <= top <= innerHeight - height`).
2. **Draggable Chat Window & Synchronized Anchoring**:
   - Chat window header `#akvo-rag-header` can be dragged to reposition the open chatbox.
   - When the launcher is clicked to open, the window dynamically anchors to the corresponding quadrant adjacent to the launcher.
   - Minimizing/closing the chatbox restores the launcher at the newly synchronized coordinates.
3. **Position Persistence**:
   - When `options.persistPosition: true` (default `true`), the last coordinates and quadrant are saved to `localStorage` under `options.storageKey` (default `"akvo_rag_pos"`).
   - Reloading or re-initializing restores the widget to the persisted coordinates.
4. **Auto-Expanding Multiline Textarea**:
   - `#akvo-rag-input` is an auto-expanding `<textarea>` (min-height ~38px, max-height ~120px) with `overflow-y: auto`.
   - Textarea expands dynamically as text wraps or newlines are typed without layout thrashing.
   - Pressing `Enter` dispatches the message and resets textarea height back to 1 row (~38px).
   - Pressing `Shift+Enter` inserts a newline without dispatching.
5. **Configuration Options & Lifecycle**:
   - `draggable: true` (default `true`), `persistPosition: true` (default `true`), `storageKey: "akvo_rag_pos"`, `dragThreshold: 6`.
   - All pointer/touch window listeners are cleanly unbound on `destroy()`.
   - Automated tests in `tests/unit/` verify dragging, persistence, and textarea behavior with $\ge 80\%$ test coverage.
