---
name: chatbot-ui
description: Building, styling, and customizing the embeddable Akvo RAG chat widget UI. Use when updating chatbot DOM structure, SCSS themes, animations, launcher buttons, message bubbles, or responsive chat layouts.
---

# Chatbot UI Architecture & Styling Playbook 💬

A comprehensive guide for developing, styling, and maintaining the client-side user interface of the Akvo RAG embeddable chat widget (`akvo-rag-js`).

---

## 🏛️ 1. Widget Architecture & DOM Hierarchy

The Akvo RAG chatbot is rendered dynamically in the host document as an isolated widget tree. All elements and styles are strictly namespaced to prevent host collisions.

```
document.body
├── #akvo-rag-launcher (Floating launcher pill / button)
│   ├── .akvo-launcher-icon (Custom SVG, Image, or FontAwesome icon)
│   └── .akvo-launcher-badge (Unread message counter)
│
└── #akvo-rag (Main widget container)
    ├── #akvo-rag-header (Sticky header bar)
    │   ├── .akvo-header-title (Icon + Title string)
    │   └── #akvo-rag-close-btn (Minimize / Close action)
    │
    ├── #akvo-rag-body (Scrollable message viewport)
    │   ├── .akvo-msg-system (Welcome & informational notices)
    │   ├── .akvo-msg-user (User prompt bubbles, right-aligned)
    │   ├── .akvo-msg-assistant (AI responses with markdown & citations)
    │   └── .typing-indicator (Three-dot animated thinking state)
    │
    └── #akvo-rag-input-container (Fixed input footer)
        ├── input[type="text"] (User prompt input field)
        └── button (Submit action with .akvo-send-spinner)
```

---

## 🎨 2. Styling Standards & Widget Isolation

### CSS Namespacing Rules
* **Root Scope**: All styles must be scoped strictly under `#akvo-rag` and `#akvo-rag-launcher` in `src/scss/_chatbot.scss`.
* **Class Prefixing**: Every class declared for widget elements MUST use the `akvo-` prefix (e.g. `.akvo-msg-user`, `.akvo-header-title`, `.akvo-send-spinner`).
* **Zero Global Pollution**: Never write naked element selectors (`div`, `p`, `button`) at top-level SCSS. Always nest under `#akvo-rag`.

### Dynamic Theming via CSS Custom Properties
The widget supports run-time color theming without rebuilding styles:

```scss
// src/scss/_chatbot.scss
#akvo-rag,
#akvo-rag-launcher {
  --akvo-primary: #{v.$primary-color}; // Fallback to SCSS variable ($primary-color = #005a9c)
}
```

When instantiated with `new AkvoRagChatbox({ primaryColor: '#0f766e' })`, the widget sets:
```javascript
this.container.style.setProperty('--akvo-primary', options.primaryColor);
if (this.launcher) {
  this.launcher.style.setProperty('--akvo-primary', options.primaryColor);
}
```

### Layout Specifications
* **Default Dimensions**: Width `380px`, Height `540px` (controlled by `v.$chatbot-width` and `v.$chatbot-height`).
* **Z-Index Layering**: Base z-index `99999` ensuring the widget floats above host headers and overlays. Popovers use `z-index: 99999 !important`.
* **Border Radius & Elevation**: Border radius `12px`, soft drop shadow `0 4px 12px rgba(0, 0, 0, 0.1)`.

---

## 🧩 3. Key UI Components & Implementation Patterns

### 1. Launcher Button (`#akvo-rag-launcher`)
Floating trigger mounted at the bottom-right corner of the viewport:
* Supports custom SVG markup, image URLs, or FontAwesome class strings via `options.launcherIcon`.
* Sanitizes SVG input using `DOMPurify.sanitize(icon, { USE_PROFILES: { svg: true } })`.
* Handles smooth scale transition between launcher and open chatbox.

### 2. Message Bubbles (`#akvo-rag-body`)
Messages are dynamically created via `appendMessageToBody(role, markdownText, isTyping, counter)`:

| Message Type | Selector | Alignment | Styling |
|---|---|---|---|
| **User** | `.akvo-msg-user` | Right (`margin-left: auto`) | Tinted primary background, rounded `12px` |
| **Assistant** | `.akvo-msg-assistant` | Left (`margin-right: auto`) | Neutral gray (`#e6e6e6`), rich markdown formatting |
| **System** | `.akvo-msg-system` | Center | Muted italic text for status or welcome |

### 3. Typing / Thinking Indicator
While awaiting first stream token from the WebSocket:
```html
<div class="typing-indicator">
  <span></span><span></span><span></span>
</div>
```
Animated using `@keyframes typing-bounce` with staggered `animation-delay` (`0.2s`, `0.4s`).

### 4. Auto-Scroll Management
On every appended chunk or new message, update scroll position:
```javascript
const body = document.querySelector("#akvo-rag-body");
if (body) {
  body.scrollTop = body.scrollHeight;
}
```

---

## 🛡️ 4. Security & Accessibility (a11y) Protocols

1. **Mandatory DOMPurify Sanitization**:
   All user-supplied text and parsed markdown HTML must be sanitized before DOM injection:
   ```javascript
   const rawHTML = marked.parse(markdownText || "");
   const safeHTML = DOMPurify.sanitize(rawHTML);
   msg.innerHTML = safeHTML;
   ```
2. **Keyboard Ergonomics**:
   * Pressing `Enter` in the input field triggers `_handleSend()`.
   * Visible `:focus-visible` outlines on buttons and input fields to support keyboard navigation.
3. **Responsive Mobile Viewports**:
   On small screens (`max-width: 480px`), the chatbox expands to occupy full mobile width:
   ```scss
   @media (max-width: 480px) {
     #akvo-rag {
       width: calc(100vw - 20px);
       right: 10px;
       bottom: 10px;
       height: calc(100vh - 100px);
     }
   }
   ```

---

## 🧪 5. Verification & Testing

* Run full test suite: `npm test`
* Run launcher and styling tests: `node --test tests/unit/launcher.test.mjs`
* Build production bundles: `npm run build` (outputs `dist/akvo-rag.js` and `dist/akvo-rag.css`)
