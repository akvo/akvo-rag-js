---
description: Verify phase - run full validation suite
---

# Phase 4: Verify (Generic)

## Purpose
Run all linters, type checkers, and test suites to ensure the implementation meets the technical and quality standards.

## Prerequisites
- **Phase 3 (Integrate)** completed with all integration tests passing.
- All unit tests passing.

## If This Phase Fails
1. **Do not proceed** to Phase 5 (Ship).
2. Address the failure in the relevant component.
3. Re-run the full verification suite until 100% success is achieved.

## Steps

**Set Mode:** Use `task_boundary` to set mode to **VERIFICATION**.

### 1. Code Quality Validation
Run the project's quality suite:
- **Linting**: Check for style violations.
- **Formatting**: Ensure consistent code style.
- **Type Checking**: Verify type safety.

### 2. Full Test Suite
Run the complete test suite (Unit + Integration + E2E).

### 3. Build Check
Ensure the code can be built for production without errors.

### 4. Coverage Audit
Verify that domain logic meets the project's coverage mandates (default target: >85%).

### 5. Global Tooling Pre-Flight (Playwright, Context7, Strix)
Before running E2E browser tests or security audits, verify global tool readiness:
```bash
# Quick pre-flight check across all global CLI tools
.agent/scripts/check-global-tools.sh
```
- **Playwright**: Verify version (`playwright --version`) before UI automation.
- **Context7**: Verify version (`ctx7 --version`) before external API/doc lookups.
- **Strix Security**: Verify version (`strix -v`) before pentest/vulnerability scans.

## Development Commands

```bash
# Full Test Suite (Native Node.js Test Runner)
npm test

# Single Test File Execution
node --test tests/unit/<test_name>.test.mjs

# Production Build Bundle
npm run build
```

## Completion Criteria
- [ ] All linting and formatting checks pass.
- [ ] Production build succeeds.
- [ ] Overall coverage meets the project target.
- [ ] Accessibility (WCAG) and Performance targets verified.

## Next Phase
Proceed to **Phase 5: Ship** (`/5-commit`)
