# STORY-017: Floating Launcher (FAB) & Custom UI Theming

- **Epic**: [CHAT-001] akvo-rag-js Package Enhancement (Launcher & Custom UI)
- **Feature Spec**: `agent_docs/features/16-launcher-custom-ui.md`
- **GitHub Issue**: [#16](https://github.com/akvo/akvo-rag-js/issues/16)
- **Status**: Ready for Implementation

---

## Story Statement
As an end user and host application developer (IDC / IDH),  
I want the chatbot widget to render as a discrete circular floating launcher button (FAB) with custom brand theming and icon support,  
So that the widget is unobtrusive, matches our portal design, and expands smoothly when activated.

---

## Acceptance Criteria
1. **FAB Launcher**:
   - Circular button `#akvo-rag-launcher` (56x56px) positioned at `bottom: 24px; right: 24px; z-index: 99998`.
   - When `startMinimized: true` (or by default), chatbox `#akvo-rag` is hidden and launcher is visible.
2. **Toggle Interaction**:
   - Clicking `#akvo-rag-launcher` reveals `#akvo-rag` and hides `#akvo-rag-launcher`.
   - Clicking close/minimize in header hides `#akvo-rag` and restores `#akvo-rag-launcher`.
3. **Icon Customization**:
   - `options.launcherIcon` supports SVG string, image URL, or CSS class.
   - `options.headerIcon` renders avatar/icon next to title text in `.akvo-chatbox-header`.
   - All rendered SVG/HTML is sanitized with DOMPurify.
4. **Theming**:
   - Supports `options.primaryColor` via `--akvo-primary` CSS custom property.
   - Header, launcher, send button, and citation links adapt to `--akvo-primary`.
5. **DOM Lifecycle**:
   - Calling `destroy()` cleans up `#akvo-rag-launcher`, `#akvo-rag`, and removes all attached event listeners.
