---
name: a11y-auditor
description: Web accessibility audit and WCAG 2.1 Level AA compliance checker. Use when testing HTML/CSS components for keyboard navigation, focus management, ARIA semantics, color contrast, focus traps, or screen reader compatibility.
---

# Accessibility (a11y) Auditor & WCAG 2.1 AA Compliance

An in-depth accessibility testing guide providing concrete HTML/JS patterns and verification checklists to ensure web applications are fully accessible to keyboard and screen-reader users.

---

## ♿ Comprehensive Accessibility Checklists

### 1. Keyboard Navigation & Focus Traps

#### Modal Dialog Focus Trap Pattern (Vanilla JS)
When opening a modal or drawer, keyboard focus MUST be trapped within the dialog container:

```javascript
export function trapFocus(modalElement) {
  const focusableElements = modalElement.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  firstElement.focus();

  modalElement.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    } else if (e.key === 'Escape') {
      closeModal(); // Must close on Escape
    }
  });
}
```

* **Focus Indicators**: Never write `outline: none` without providing an equivalent visible focus ring:
  ```css
  /* Good: Visible custom keyboard focus ring */
  :focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }
  ```

---

### 2. ARIA Semantics & Screen Reader Announcements

* **Dynamic Content (ARIA Live Regions)**:
  For live score updates, cart notifications, or error alerts:
  ```html
  <!-- Polite: Announced when user is idle -->
  <div aria-live="polite" aria-atomic="true" id="cart-notification"></div>

  <!-- Assertive: Announced immediately for critical errors -->
  <div role="alert" aria-live="assertive" id="error-banner"></div>
  ```
* **Icon-Only Buttons**:
  ```html
  <!-- ❌ Bad: Silent to screen readers -->
  <button><i class="icon-trash"></i></button>

  <!-- ✅ Good: Accessible label -->
  <button aria-label="Delete item"><i class="icon-trash" aria-hidden="true"></i></button>
  ```

---

### 3. Contrast Ratios & Visual Accessibility

| Element Type | Minimum WCAG AA Contrast | Minimum WCAG AAA Contrast |
|---|---|---|
| **Body & Small Text** (< 18pt or < 14pt bold) | **4.5 : 1** | **7.0 : 1** |
| **Large Text** (>= 18pt or >= 14pt bold) | **3.0 : 1** | **4.5 : 1** |
| **UI Components & Form Borders** | **3.0 : 1** | **3.0 : 1** |

* **Formula Check**:
  $$\text{Contrast Ratio} = \frac{L_1 + 0.05}{L_2 + 0.05}$$
  Where $L_1$ is the relative luminance of the lighter color and $L_2$ is the relative luminance of the darker color.

---

### 4. Forms & Interactive Controls

- [ ] **Explicit Label Associations**: Every input must have a `<label for="inputId">` or `aria-labelledby`.
- [ ] **Error Message Association**: Associate error text with input via `aria-describedby="inputErrorId"` and mark invalid inputs with `aria-invalid="true"`.
- [ ] **Touch Target Sizing**: Minimum interactive touch area of **44x44 CSS pixels** (or `48x48px` on mobile screens) with at least `8px` separation.
