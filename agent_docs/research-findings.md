# Research Findings: Comprehensive Bug Audit (2026-03-09)

**Auditor**: Mary (Business Analyst)
**Scope**: Codebase audit for stability, performance, and security.

## Summary of Findings

| ID | Issue | Severity | Component | Description |
|---|---|---|---|---|
| B001 | Global State Persistence | High | `chatbot.js` | Chat history and connection state are stored in module-level variables. Re-initializing the widget without a page reload will lead to state leakage. |
| B002 | Missing Cleanup Mechanism | High | `chatbot.js` | No destructor or `destroy()` method exists. WebSockets and event listeners remain active if the widget is removed from the DOM. |
| B003 | Inefficient Streaming | Medium | `chat-renderer.js`| Currently re-parses and re-sanitizes the entire markdown message for every incoming chunk. This will cause lag in long conversations. |
| B004 | Linear Reconnection | Medium | `websocket.js` | Uses a fixed 3-second delay. This can overwhelm a struggling backend compared to exponential backoff. |
| B005 | Brittle Chunk Parsing | Medium | `chat-renderer.js`| RegEx-based JSON value extraction is susceptible to failure if the LLM output contains specific characters or escapes. |
| B006 | CSS Style "Leak-in" | Low | `_markdown.scss` | Lack of a comprehensive reset (like `box-sizing: border-box`) leaves the widget vulnerable to layout shifts from host site styles. |

## Detailed Analysis

### 1. State Management (B001, B002)
The current implementation assumes a "one-page, one-session" model. Modern SPAs (Single Page Applications) might mount/unmount the widget multiple times. Without a `destroy` method and localized state (e.g., inside a class or closure), memory leaks and data pollution are inevitable.

### 2. Streaming Performance (B003)
LLM responses can reach thousands of tokens. Re-rendering the entire message every 30ms (average chunk rate) means thousands of DOM operations and RegEx executions.
**Recommendation**: Implement a throttle or only append new parts if possible (though Markdown makes "appending" tricky as markers might span chunks).

### 3. Resilience (B004)
The backend connection is the lifeline of RAG. A static 3-second retry is "all-or-nothing".
**Recommendation**: Implement exponential backoff (e.g., 1s, 2s, 4s, 8s...) with jitter.

### 4. Isolation (B006)
While namespacing is used, the widget doesn't protect itself from parent site inherited styles (like `line-height` or `font-size` on `div` or `li`).
**Recommendation**: Add a root reset that explicitly sets all critical properties to defaults.

## Next Steps
Hand off to **Winston (Architect)** to design structural fixes for B001 and B002, and **Amelia (Dev)** for performance optimizations.
