# ADR-004: Component Instance Pattern for Chatbot

- **Status**: Proposed
- **Context**: The current `chatbot.js` uses module-level global variables for state (`wsConnection`, `chatHistory`, etc.). This prevents multiple instances on the same page and leads to memory leaks because there is no way to "clean up" or "destroy" a chatbot instance.
- **Decision**: Refactor `initChat` to return an instance of a `Chatbot` class (or a closure-based controller object). All state will be encapsulated within the instance. The instance will provide a `destroy()` method to close the WebSocket and remove all DOM event listeners.
- **Alternatives Considered**:
    - *Continue with Globals*: Rejected due to lack of scalability and cleanup issues.
    - *React/Vue*: Rejected to stay zero-dependency as per project goals.
- **Consequences**:
    - **Pros**: Enables multiple widgets on one page; provides a clean API for host applications to manage the widget's lifecycle.
    - **Cons**: Requires a significant refactor of `chatbot.js`.
