# Architecture: Test Suite Integration

## Overview
The test suite is designed to be lightweight, dependency-free (relying on Node.js native capabilities), and integrated into the developer workflow.

## Directory Structure
```text
/tests
  /unit
    text-cleaner.test.js    # Logic checks for string manipulation
    chat-renderer.test.js   # Logic checks for message parsing (optional)
  /integration
    markdown-rendering.test.js # GFM and Sanity checks
  /fixtures
    markdown-stress-test.md  # Standard test data
```

## Execution Flow
1. **Trigger**: Developer runs `npm test`.
2. **Discovery**: `node --test` finds all files matching `tests/**/*.test.js`.
3. **Execution**: Tests are run in parallel by default.
4. **Reporting**: Results are printed to the console using the TAP (Test Anything Protocol) or standard reporter.

## Module Resolution
Since the project uses Babel for the main bundle, we will ensure tests can import from `src/` either by:
- Using `experimental-vm-modules` (if ESM).
- Or ensuring utility files are written in a way that Node can consume them directly (minimal syntax requirements).
