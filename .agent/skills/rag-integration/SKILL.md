# Skill: RAG Integration

Handles the logic for connecting the widget to the Akvo RAG backend and processing responses.

## Core Capabilities

### 1. Streaming Response Parsing
- Handle Chunked Transfer Encoding responses.
- Use `text-cleaner.js` to strip metadata before rendering.

### 2. Citation Parsing
- Regex-based identification of citation markers (e.g., `[1]`, `(Source A)`).
- Link markers to the citation data returned in the response metadata.

### 3. State Management
- Track `conversation_id` throughout the session.
- Handle "Clear History" and "New Chat" actions.

### 4. Error Recovery
- Implement exponential backoff for connection failures.
- Show friendly retry buttons for users.

## Security
- Validate tokens before every request.
- Ensure no PII is logged in the debug console.
