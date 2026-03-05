# Research Findings: Test Suite Integration

## Current Verification Scripts
We have two primary verification scripts currently residing in `/tmp/`:

1. **`test-fix-v2.js`**:
    - Validates `text-cleaner.js` logic.
    - Contains a subset of the actual `cleanStreamingText` logic (re-defined).
    - Uses a simple array-based test runner.
    - **Gap**: Relies on duplication of code instead of importing from `src/`.

2. **`test-markdown-rendering.js`**:
    - Validates `marked` configuration and GFM support.
    - Relies on absolute paths to `node_modules`.
    - **Gap**: Requires manual execution and visual inspection of console logs.

## Infrastructure Analysis
- **Framework**: No existing test framework (Jest, Mocha, etc.) is installed.
- **Environment**: Node.js environment is available.
- **Build**: Webpack is used for bundling, but tests should ideally run against raw source or transpiled modules.

## Recommendations
1. **Directory Structure**: Create a `tests/` root directory with `unit/` and `integration/` subfolders.
2. **Test Runner**: Since the project is lightweight, we can either:
    - Use the built-in Node.js `node --test` runner (available in Node 18+).
    - Use a lightweight framework like `vitest` or `jest` if we expect significant logic growth.
    - *Decision*: Start with `node --test` to avoid adding heavy dependencies, as it matches the project's minimal philosophy.
3. **Module Support**: Use `import/export` via Babel or standard Node.js ESM to allow tests to import directly from `src/`.
