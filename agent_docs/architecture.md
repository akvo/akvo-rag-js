# Architecture: akvo-rag-js *Last updated: 2026-03-09*

## System Overview
Akvo RAG JS is a client-side chat widget that communicates with a RAG (Retrieval-Augmented Generation) backend via WebSockets. It provides a streaming interface for AI responses with support for markdown rendering and citations.

## Component Design

### 1. Chat Widget (chatbot.js)
The main entry point that provides a `Chatbot` class or instance for initializing the UI and managing the WebSocket connection lifecycle. It encapsulates state to support multiple instances and proper cleanup via a `destroy()` method.

### 2. UI Rendering (utils/chat-renderer.js)
Handles the rendering of messages into the DOM. Uses `marked` for markdown and `dompurify` for sanitization.
- **Streaming Strategy**: Chunks are concatenated into a buffer and re-rendered as they arrive.
- **Optimization**: To ensure smooth performance, the renderer implements a **change-detection check** that skips expensive Markdown parsing and DOM sanitization if the cleaned text hasn't changed between streaming chunks.

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

## Technical Stack & Standards

### Runtime & Modules
- **Stack**: Node.js (v18+) based development.
- **Module System**: **Native ES Modules (ESM)**.
  - `type: module` enabled in `package.json`.
  - Strict requirement for `.js` extensions in internal imports.
  - Webpack build tools use `.cjs` where CommonJS is necessary.

### Testing Standard
- **Runner**: Node.js Native Test Runner (`node --test`).
- **Convention**: Test files are located in `/tests` with `.test.mjs` extension.
- **Strategy**: Automated unit and integration tests serve as quality gates for utility logic and rendering.

## Security
- All HTML output is sanitized using `dompurify`.
- No sensitive credentials stored client-side.
- CSP-compliant (namespaced styles and local bundling).
- Sanitize raw text stream via `text-cleaner.mjs`.

