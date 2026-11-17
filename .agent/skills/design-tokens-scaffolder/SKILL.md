---
name: design-tokens-scaffolder
description: Bridge between design tools (Figma) and code. Use when extracting, scaffolding, or maintaining design tokens, CSS custom properties, and Tailwind theme configurations.
---

# Design Tokens Scaffolder: Figma to Code Architecture

A systematic guide for translating design systems and Figma Dev Mode specs into strict, maintainable CSS custom properties and framework theme configurations.

---

## 🎨 3-Tier Design Token Architecture

Structure design tokens into 3 distinct tiers to ensure maintainability:

```
[ Tier 1: Global / Primitives ] ──> [ Tier 2: Semantic / Context ] ──> [ Tier 3: Component Scoped ]
  e.g. --blue-500: #3b82f6            e.g. --color-action-primary        e.g. --btn-primary-bg
```

### 1. Primitive Tokens (`:root`)
```css
:root {
  /* Primitive Colors */
  --blue-50: #eff6ff;
  --blue-500: #3b82f6;
  --blue-700: #1d4ed8;
  --slate-900: #0f172a;
  --slate-500: #64748b;

  /* Primitive Spacing (4px grid) */
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem;  /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem;    /* 16px */
  --space-6: 1.5rem;  /* 24px */
  --space-8: 2rem;    /* 32px */

  /* Primitive Radii */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}
```

### 2. Semantic Tokens
```css
:root {
  /* Semantic Roles */
  --color-bg-canvas: #ffffff;
  --color-bg-surface: #f8fafc;
  --color-text-body: var(--slate-900);
  --color-text-muted: var(--slate-500);

  --color-action-primary-default: var(--blue-500);
  --color-action-primary-hover: var(--blue-700);
}

/* Dark Mode Tokens */
[data-theme='dark'] {
  --color-bg-canvas: #0f172a;
  --color-bg-surface: #1e293b;
  --color-text-body: #f8fafc;
  --color-text-muted: #94a3b8;
  --color-action-primary-default: #60a5fa;
  --color-action-primary-hover: #3b82f6;
}
```

---

## 🛠️ Tailwind Theme Mapping

Integrate CSS variables cleanly into `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-bg-canvas)',
        surface: 'var(--color-bg-surface)',
        action: {
          primary: {
            DEFAULT: 'var(--color-action-primary-default)',
            hover: 'var(--color-action-primary-hover)'
          }
        }
      },
      borderRadius: {
        theme: 'var(--radius-lg)'
      }
    }
  }
};
```

---

## 🔍 Figma Dev Mode Extraction Protocol

When using Figma Dev Mode MCP:
1. Extract named **Color Styles** and map them to Semantic Tokens (avoid arbitrary one-off hex codes).
2. Read **Auto Layout** padding/spacing and snap to the 4px primitive grid scale (`space-1` to `space-8`).
3. Extract **Typography Styles** (font family, weight, line-height, letter-spacing) as complete composite font classes.
