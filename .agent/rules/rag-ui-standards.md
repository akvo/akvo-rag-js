---
trigger: always_on
description: UI standards for RAG (Retrieval-Augmented Generation) features like citations and message rendering.
---

# RAG UI Standards

Follow these standards when rendering RAG-specific content to ensure clarity and security.

## 1. Message Rendering
- All AI responses must be rendered through `marked` for Markdown support.
- **SECURITY**: Use `dompurify` to sanitize all rendered HTML before inserting into the DOM.
- Use `text-cleaner.js` to remove unwanted artifacts from the raw AI stream.

## 2. Citations & References
- Citations should be displayed as small, clickable bubbles or superscripts.
- Clicking a citation must open a popover using `citations-popover.js`.
- Citations must clearly link to the source document title or ID.

## 3. Streaming Response UX
- Show a "typing" or "thinking" indicator while the response is streaming.
- Smoothly append new chunks to the message container without causing visual jumps.
- Auto-scroll to the bottom of the chat unless the user has manually scrolled up.

## 4. Error States
- If the RAG process fails, display a user-friendly error message.
- Provide a "Retry" or "Start Over" button for transient failures.
