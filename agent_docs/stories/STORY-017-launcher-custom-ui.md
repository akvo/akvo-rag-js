# STORY-017: Floating Launcher (FAB) & Custom UI Theming

- **Epic**: [CHAT-001] akvo-rag-js Package Enhancement (Launcher & Custom UI)
- **Feature Spec**: `agent_docs/features/16-launcher-custom-ui.md`
- **GitHub Issue**: [#16](https://github.com/akvo/akvo-rag-js/issues/16)
- **Status**: Completed

---

## Story Statement
As an end user and host application developer,  
I want the chatbot widget to render as a discrete circular floating launcher button (FAB) with custom brand theming, icon support, and full size/position parameterization,  
So that the widget is unobtrusive, matches our portal design, and expands smoothly when activated.

---

## Acceptance Criteria
1. **FAB Launcher**:
   - Circular button `#akvo-rag-launcher` (default 56x56px, customizable via `launcherSize`, `launcherWidth`, `launcherHeight`) positioned at `bottom: 24px; right: 24px; z-index: 99998`.
   - When `startMinimized: true` (or by default), chatbox `#akvo-rag` is hidden and launcher is visible.
2. **Toggle Interaction**:
   - Clicking `#akvo-rag-launcher` reveals `#akvo-rag` and hides `#akvo-rag-launcher`.
   - Clicking close/minimize in header hides `#akvo-rag` and restores `#akvo-rag-launcher`.
3. **Icon Customization**:
   - `options.launcherIcon` supports SVG string, image URL, or CSS class.
   - `options.headerIcon` renders avatar/icon next to title text in `.akvo-chatbox-header`.
   - All rendered SVG/HTML is sanitized with DOMPurify.
4. **Theming, Sizing & Positioning**:
   - Supports `options.primaryColor` via `--akvo-primary` CSS custom property.
   - Header, launcher, send button, and citation links adapt to `--akvo-primary`.
   - Supports `width` and `height` dimensions (`number` or `string` with unit) cascading via `--akvo-width` and `--akvo-height`.
   - Supports `position: "bottom-left"` and `"bottom-right"` (default).
   - Supports `borderRadius` (`number` or `string` with unit) and `zIndex`.
   - Supports `launcherSize`, `launcherWidth`, and `launcherHeight` for fine-grained button dimension control.
5. **DOM Lifecycle**:
   - Calling `destroy()` cleans up `#akvo-rag-launcher`, `#akvo-rag`, and removes all attached event listeners.
