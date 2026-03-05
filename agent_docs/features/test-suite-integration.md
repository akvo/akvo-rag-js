# Feature: Test Suite Integration

## Overview
As the project grows, manual verification using temporary scripts becomes unsustainable. This feature aims to establish a formal `tests/` directory and integrate verification logic into the project's standard lifecycle via `npm test`.

## User Stories
- [STORY-TEST-01]: As a developer, I want to run all verification checks with a single command (`npm test`).
- [STORY-TEST-02]: As a maintainer, I want tests to be co-located with the source code for better visibility.

## Requirements
- **Functional**: Migrate `/tmp/test-fix-v2.js` to `tests/unit/text-cleaner.test.js`.
- **Functional**: Migrate `/tmp/test-markdown-rendering.js` to `tests/unit/markdown-rendering.test.js`.
- **Functional**: Add a `test` script to `package.json`.
- **Technical**: Ensure tests can run in a standard Node.js environment.
- **Technical**: Use a simple, dependency-free test runner or a lightweight framework if already available.

## Acceptance Criteria
- `npm test` executes both spacing and markdown verification.
- All tests pass in the new location.
- Documentation (README) is updated with "How to Run Tests".
