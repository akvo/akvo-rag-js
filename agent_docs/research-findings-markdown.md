# Research Findings: Enhanced Markdown Support

## Current State Analysis
The widget uses `marked` v15.x and `dompurify` v3.x.

### Rendering Logic
In `src/utils/chat-renderer.js`, rendering is done via:
```javascript
const rawHTML = marked.parse(cleanedText);
const safeHTML = DOMPurify.sanitize(rawHTML);
```
- **Pros**: Already uses standard industry tools.
- **Cons**: No configuration passed to `marked`. Default behavior might not include all GFM features if not explicitly enabled (though v15 is mostly GFM-compliant by default).
- **Cons**: `dompurify` default settings are safe but might strip useful classes or attributes if we add custom rendering.

### Styling Logic
Currently, `_chatbot.scss` has very limited styles for markdown:
- Basic paragraph margins.
- No styles for `<ul>`, `<li>`, `<table>`, `<th>`, `<td>`, `<code>`, `<pre>`, `<blockquote>`.
- **Conflict Risk**: Lists (`ul/li`) are highly susceptible to "CSS resets" from parent sites, often resulting in bullets being hidden or misaligned.

## Recommendations

### 1. Marked Configuration
- Enable `gfm: true`, `breaks: true` (standard for chat to respect newlines).
- Use `marked.setOptions()` or pass config to `.parse()`.

### 2. DOMPurify Configuration
- Keep defaults but ensure `USE_PROFILES: { html: true }` is implicit.
- If we add custom IDs for citations or copy buttons, ensure `ADD_ATTR` or `ADD_TAGS` is used.

### 3. CSS "Reset" & Isolation
- Implement a scoped CSS reset for all markdown elements within `.akvo-msg-assistant`.
- Specifically target:
    - Lists: Apply `list-style-type: disc`, `margin-left` and `padding-left`.
    - Tables: `border-collapse`, `width: 100%`, and standard `td/th` padding/borders.
    - Code: Monospace font, background color, and `overflow-x: auto` for large blocks.

### 4. Integration
- Add a dedicated `_markdown.scss` or expand `_chatbot.scss` with a "Markdown Styles" section.
- Ensure `akvo-` prefixes are consistently used for the wrapper.

## Acceptance Criteria Refinement
- GFM tables render with borders and alternating row colors (zebra striping).
- Nested lists (up to 3 levels) have distinct bullet styles.
- Code blocks have a distinct background and use a monospace font family.
- Blockquotes have a vertical border and muted text color.
