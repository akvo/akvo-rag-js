---
name: rag-integration
description: Integration with Akvo RAG backend via WebSocket, streaming token accumulation, citation parsing, and state management. Use when handling websocket connections, parsing __LLM_RESPONSE__, rendering citations, or managing chat sessions.
---

# Akvo RAG Backend Integration & Streaming Playbook ⚡

A technical specification and integration guide for managing real-time WebSocket communication, streaming response processing, citation resolution, and conversation state in `akvo-rag-js`.

---

## 🔌 1. WebSocket Lifecycle & Protocol Contract

All communication between the client widget and the Akvo RAG backend is handled through persistent WebSockets in `src/lib/websocket.js`.

### Connection Handshake
Upon WebSocket `onopen`, the client immediately transmits authentication metadata:

```json
{
  "type": "auth",
  "visitor_id": "c9a6b8e2-45e1-4c12-9c10-...",
  "kb_id": "knowledge-base-uuid"
}
```

### Keepalive Heartbeat
* **Server Ping**: When receiving `{"type": "ping"}`, the client must immediately respond with `{"type": "pong"}` to prevent connection drops by intermediate proxies.

### Exponential Backoff Reconnection
If the socket drops with an abnormal closure code (`event.code !== 1000`):
* Reconnection attempts increment up to `maxReconnectAttempts = 10`.
* Backoff delay calculation: `Math.min(initialDelay * 2^(attempt - 1), maxDelay) + jitter` where `initialDelay = 1000ms`, `maxDelay = 30000ms`, and `jitter = +/- 500ms`.
* Triggers optional client-level callbacks: `onReconnect(attempt)` and `onMaxReconnect()`.

---

## 🌊 2. Streaming Response & Token Accumulation

Streaming responses arrive incrementally via `{"type": "response_chunk", "content": "..."}` events.

### Technical Token Sanitization (`accumulateAssistantText`)
Located in `src/utils/chat-renderer.js`, this function filters streaming artifacts:
1. **Metadata Filter**: Drops internal metadata payloads starting with `^\s*d:\{`.
2. **Prefix Stripping**: Strips numerical stream prefixes like `0:`, `1:`, etc.
3. **Boundary Quote Stripping**: Strips wrapping quotes while preserving internal escaped quotes.
4. **JSON Escape Decoding**: Safely unescapes raw sequences like `\n` or `\"` using guarded `JSON.parse`.

### Post-Processing Text Normalization (`cleanStreamingText`)
Located in `src/utils/text-cleaner.js`, this pipeline rectifies common LLM streaming anomalies:
* **Spaced Characters**: Collapses artificially separated letters (e.g. `A G R A` ➔ `AGRA`).
* **Punctuation Spacing**: Removes trailing spaces preceding `, . : ; ! ?`.
* **Markdown Cleanup**: Closes gaps inside formatting delimiters (e.g. `** text **` ➔ `**text**`, `` ` code ` `` ➔ `` `code` ``).
* **Line Joining**: Joins orphaned lines broken mid-sentence if the previous line lacks ending punctuation.

---

## 📚 3. Citations & Context Extraction Architecture

The backend bundles document context alongside generated text using the `__LLM_RESPONSE__` delimiter:

```
[base64-encoded JSON context]__LLM_RESPONSE__[Markdown text with [citation:X] tags]
```

### Context Decoding
1. The WebSocket listener splits `data.content` on `__LLM_RESPONSE__`.
2. Base64 payload is cleaned via `cleanBase64()` and decoded via `atob()`.
3. The context structure contains an array of sources:
   ```javascript
   const citations = contextData?.context?.map((c, index) => ({
     id: index + 1,
     text: c.page_content,
     metadata: {
       source: c.metadata?.source || "Unknown Source",
       title: c.metadata?.title || "Untitled Document",
       page: c.metadata?.page_label || c.metadata?.page || "n/a"
     }
   })) || [];
   ```

### Popover Replacement (`replaceCitations`)
Located in `src/utils/citations-popover.js`:
* Locates citation tags matching `(\[|&?#?[a-zA-Z0-9]+;)\s*citation:\s*${id}\s*(\]|...)`.
* Replaces matched tokens with interactive superscript tags:
  ```html
  <sup class="citation" data-id="1" data-text="..." data-source="..." data-page="..." data-title="...">[1]</sup>
  ```
* Strips hallucinated or unmatched `[citation:X]` tags automatically.
* Binds `mouseenter` and `mouseleave` handlers to render an absolute floating `.citation-popover` positioned above or below the citation badge.

---

## 🧠 4. State & Session Management

### Visitor Identification
* `getOrCreateVisitorId()` in `src/utils/uuid.js` generates or retrieves a UUIDv4 from `localStorage` under key `akvo_visitor_id`.
* Enables persistent user memory and continuous context across page reloads.

### Multi-Turn Chat History
* Maintained in `this.chatHistory` array within `AkvoRagChatbox`.
* Capped to recent context window via `CHAT_HISTORY_SLICE = -10` to avoid payload bloat when sending prompts to the backend:
  ```javascript
  const payload = {
    type: "message",
    query: text,
    history: this.chatHistory.slice(CHAT_HISTORY_SLICE),
    visitor_id: this.visitorId,
    kb_id: this.options.kb_id
  };
  this.wsConnection.socket.send(JSON.stringify(payload));
  ```

---

## 🔒 5. Security & Privacy Safeguards

1. **Strict Sanitization**: Never inject `data.content` directly into `innerHTML`. Always run markdown through `DOMPurify.sanitize(marked.parse(text))`.
2. **Zero PII in Client Logs**: Do not log raw visitor identities, auth tokens, or private conversational payload content in client console outside debug mode.
3. **WSS / HTTPS Only**: In production environments, reject insecure `ws://` connections in favor of `wss://`.

---

## 🧪 6. Deterministic Verification

Run tests targeting RAG streaming, token cleaner, and citation parsing:
```bash
# Run all tests
npm test

# Test streaming token accumulation & quote fixes
node --test tests/unit/accumulateAssistantText.test.mjs

# Test citation replacement and popovers
node --test tests/unit/citations.test.mjs

# Test text cleaner formatting
node --test tests/unit/text-cleaner.test.mjs
```
