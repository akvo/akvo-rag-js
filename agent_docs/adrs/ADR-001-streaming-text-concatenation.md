# ADR-001: Streaming Text Concatenation Strategy

- **Status**: Accepted
- **Context**:
  The chat widget was injecting a space between every response chunk received from the WebSocket. This caused words to break (e.g., "allev iation") when chunk boundaries fell inside words. While a text cleaner was present, it had limitations (e.g., max length) that prevented it from fixing all occurrences.

- **Decision**:
  We will switch to direct concatenation of chunks without manual space injection. Most modern LLM stream outputs include their own whitespace tokens, making manual injection redundant and harmful to word integrity.

- **Alternatives Considered**:
  1. **Increasing Text Cleaner Limit**: This only addresses symptoms and could lead to false positives (joining words that should be separate).
  2. **Wait for full Word**: Waiting for a space before rendering would break the "streaming" feel and increase latency.

- **Consequences**:
  - Improved word integrity in streaming responses.
  - Dependency on the backend/upstream LLM to provide correct spacing (which is standard behavior).
  - Risk of missing spaces if an unusual LLM setup is used that expects the client to provide spacing (unlikely).
