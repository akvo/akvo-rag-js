---
trigger: always_on
description: Rules for ensuring the widget does not interfere with the parent site's styles or scripts.
---

# Widget Isolation Standards

To ensure the Akvo RAG widget works seamlessly on any parent website, follow these isolation rules:

## 1. CSS Namespacing
- All CSS classes must be prefixed with `akvo-`.
- Avoid targeting generic HTML tags (e.g., `div`, `button`) without the `akvo-` prefix.
- Use a root wrapper ID `#akvo-rag-widget` for all widget components.

## 2. Style Encapsulation
- Use high-specificity selectors to prevent parent site styles from overriding widget styles.
- Reset critical properties (e.g., `box-sizing: border-box`, `font-family`) at the widget root.

## 3. Global Variable protection
- Wrap all code in IIFEs or use Webpack's scope isolation.
- Do not attach variables to `window` unless explicitly required (e.g., `window.AkvoRag`).

## 4. Resource Collision
- Ensure all third-party libraries (e.g., `marked`, `dompurify`) are bundled locally to avoid version conflicts with the host site.
