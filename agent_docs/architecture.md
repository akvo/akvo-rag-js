# Architecture: akvo-rag-js

## System Overview
Akvo RAG JS is a client-side chat widget that communicates with a RAG (Retrieval-Augmented Generation) backend via WebSockets. It provides a streaming interface for AI responses with support for markdown rendering and citations.

## Component Design

### 1. Chat Widget (chatbot.js)
The main entry point that initializes the UI and manages the WebSocket connection lifecycle.

### 2. UI Rendering (utils/chat-renderer.js)
Handles the rendering of messages into the DOM. Uses `marked` for markdown and `dompurify` for sanitization.
- **Streaming Strategy**: Chunks are concatenated into a buffer and re-rendered as they arrive to provide a smooth streaming experience.

### 3. Text Processing (utils/text-cleaner.js)
A utility to post-process text before rendering. It handles:
- Removing excessive whitespace.
- Fixing common markdown artifacts from streaming.
- Sanitizing raw text stream.

### 4. Citation Management (utils/citations-popover.js)
Manages citation bubbles and popovers linked to source documents.

## Data Flow
1. User enters text -> `chatbot.js`.
2. `chatbot.js` sends "chat" message via `websocket.js`.
3. Backend streams chunks -> `chatbot.js`.
4. `chatbot.js` calls `updateStreamingAssistantMessage` in `chat-renderer.js`.
5. `chat-renderer.js` calls `cleanStreamingText` in `text-cleaner.js`.
6. Refined text is parsed by `marked` and sanitized by `dompurify`.
7. Sanitzed HTML is inserted into the chat body.

## Security
- All HTML output is sanitized using `dompurify`.
- No sensitive credentials stored client-side.
- CSP-compliant (namespaced styles and local bundling).
