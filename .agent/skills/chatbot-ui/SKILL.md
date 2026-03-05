# Skill: Chatbot UI

Specialized capabilities for building and styling the Akvo RAG chatbot widget.

## Components & Patterns

### 1. Message Bubbles
- Use `.akvo-message-user` and `.akvo-message-ai` classes.
- Ensure alignment and spacing follow the namespacing rules.

### 2. Input Bar
- Handle `Enter` key for submission.
- Implement auto-growing textareas for better UX.

### 3. Typing Indicators
- Use a three-dot animation while the AI is "thinking".

### 4. Scroll Management
- Auto-scroll to bottom of `#akvo-chat-messages` on new message.

## CSS Guidelines
- Always use the `#akvo-rag-widget` root selector.
- Prefer SCSS variables for themes (`$akvo-primary-color`, etc.).
