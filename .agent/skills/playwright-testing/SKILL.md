---
name: playwright-testing
description: End-to-end browser automation, UI visual verification, interaction testing, and console debugging using Playwright CLI and Playwright MCP.
---

# Playwright Browser Testing & UI Automation

Comprehensive guide for orchestrating browser sessions, validating interactive user flows, capturing UI screenshots, and debugging client-side errors with Playwright.

---

## 🚀 Capabilities & Use Cases

1. **Visual UI Verification**: Capture full-page or element-level screenshots to inspect responsive layout rendering and component states.
2. **End-to-End User Journeys**: Automate multi-step user actions (e.g. form filling, authentication, cart checkout, modal toggles).
3. **Console & Network Inspection**: Intercept HTTP requests/responses and capture client-side JavaScript console errors during navigation.
4. **Accessibility & DOM Auditing**: Inspect accessibility trees, aria attributes, and live computed styles.

---

## 🛠️ Modes of Operation

### 1. Model Context Protocol (MCP) Mode
When the Playwright MCP server is active (`@modelcontextprotocol/server-playwright`), the agent has direct tool access:
- `playwright_navigate`: Open URLs.
- `playwright_click`: Click interactive selectors.
- `playwright_fill`: Fill inputs and textareas.
- `playwright_screenshot`: Capture visual snapshots for layout verification.
- `playwright_evaluate`: Execute arbitrary JavaScript in the page context.

### 2. Playwright CLI Mode
Playwright is installed globally (`playwright --version`) with browser binaries stored in the global OS cache (`~/Library/Caches/ms-playwright/`). The agent executes it directly without per-project installation:
```bash
# Pre-flight: Check global version
playwright --version || npx playwright --version

# Run tests headlessly
playwright test  # or: npx playwright test

# Run specific test file
playwright test tests/e2e/auth.spec.ts

# Inspect test with UI / trace viewer
playwright show-trace trace.zip

# Generate code / test recorder
playwright codegen http://localhost:3000
```

---

## 📋 Best Practices for Agent Execution

1. **Wait for Network Idle / Specific Selectors**:
   - Always await elements using robust locators: `getByRole`, `getByText`, or semantic data attributes (`data-testid`), avoiding fragile CSS paths like `div > div:nth-child(2)`.
2. **Verify Error States**:
   - Always check console logs for 404s, CORS issues, or unhandled exceptions after navigation.
3. **Responsive Breakpoint Testing**:
   - Validate layouts at both mobile (`390x844`) and desktop (`1440x900`) viewports.
4. **Cleanup**:
   - Ensure browser contexts or dev servers are closed after test execution to prevent orphaned background processes.
