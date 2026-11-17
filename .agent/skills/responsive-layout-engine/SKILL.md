---
name: responsive-layout-engine
description: Advanced CSS layout, container queries, modern flexbox/grid, fluid typography, and view transitions. Use when building complex responsive layouts, handling multiple viewports, or creating smooth state transitions.
---

# Responsive Layout & Modern CSS Engine

A comprehensive guide for building fluid, viewport-independent layouts leveraging modern CSS capabilities: Container Queries (`@container`), CSS Subgrid, fluid clamping formulas, and the View Transitions API.

---

## 📐 Modern CSS Techniques & Production Blueprints

### 1. Container Queries (`@container`)
Container queries allow components to adapt based on their parent container's width, enabling true component portability:

```css
/* Parent Card Wrapper */
.card-wrapper {
  container-type: inline-size;
  container-name: product-card;
}

/* Default: Mobile / narrow container layout (Stacked) */
.product-card-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* When parent container exceeds 420px (Horizontal Row) */
@container product-card (min-width: 420px) {
  .product-card-body {
    flex-direction: row;
    align-items: center;
  }
  .product-card-image {
    width: 140px;
    height: 140px;
  }
}
```

---

### 2. CSS Grid & Subgrid Alignment
Align child elements (e.g. card titles, prices, action buttons) across different cards in the same row:

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 1.5rem;
}

.card-item {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 4; /* Header, Body, Price, Action button */
}
```

---

### 3. Mathematical Fluid Typography & Spacing (`clamp()`)

Avoid jumpy media queries by calculating smooth linear viewport scaling:

$$\text{font-size} = \text{clamp}(V_{\min}, \text{Rate} \times \text{vw} + \text{Base}, V_{\max})$$

```css
:root {
  /* Fluid H1: 2rem at 375px viewport -> 4rem at 1440px viewport */
  --font-fluid-h1: clamp(2rem, 1.3rem + 2.96vw, 4rem);

  /* Fluid Section Spacing: 3rem at mobile -> 6rem at desktop */
  --spacing-fluid-section: clamp(3rem, 1.94rem + 4.5vw, 6rem);
}

h1 {
  font-size: var(--font-fluid-h1);
  line-height: 1.15;
  letter-spacing: -0.02em;
}
```

---

### 4. View Transitions API (Smooth Morphing)
Enable smooth morphing between UI states:

```javascript
export function updateCartState(newCount) {
  if (!document.startViewTransition) {
    document.getElementById('cart-badge').textContent = newCount;
    return;
  }
  document.startViewTransition(() => {
    document.getElementById('cart-badge').textContent = newCount;
  });
}
```

```css
/* View Transition Name */
#cart-badge {
  view-transition-name: cart-badge;
}

/* Respect Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0.01ms !important;
  }
}
```
