---
name: feature-dev
description: Comprehensive 7-phase feature development lifecycle. Use when building new features to ensure deep exploration, requirement clarification, architectural planning, test-driven implementation, verification, and code review.
---

# Feature Development Lifecycle: The 7-Phase Protocol

A rigorous, professional development standard designed to prevent architectural drift, unvalidated assumptions, and untested code.

---

## 🔄 Phase Overview

```
Phase 1: Explore ──> Phase 2: Clarify ──> Phase 3: Plan ──> Phase 4: Test-First (TDD)
                                                                    │
Phase 7: Review <── Phase 6: Verify <── Phase 5: Implement <────────┘
```

---

## 📋 Detailed Phase Execution

### Phase 1: Codebase Exploration & Touchpoint Discovery
- **Goal**: Build a complete mental model of existing patterns without writing or modifying files.
- **Actions**:
  1. Search existing models, schemas, controller routes, and utility helpers.
  2. Inspect dependency injection setups, database migration conventions, and test helpers.
  3. Identify all touchpoint files that will be read or modified.
- **Exit Gate**: List of affected files and confirmed understanding of architectural conventions.

### Phase 2: Requirement Clarification & Boundary Locking
- **Goal**: Eliminate ambiguity and define strict scope boundaries.
- **Actions**:
  1. Identify edge cases (empty results, permission errors, network timeouts, invalid inputs).
  2. If requirements are underspecified, present structured options to the user before proceeding.
  3. Lock scope: Quarantined tangential improvements into backlog issues.
- **Exit Gate**: Concrete acceptance criteria agreed upon with user.

### Phase 3: Architectural Design & Implementation Plan
- **Goal**: Formulate a complete design document (`implementation_plan.md` or LLD).
- **Actions**:
  1. Define data models, schema migrations (with reversible down migrations), and API contracts.
  2. Map out component state, data flow, and error propagation paths.
  3. Formulate testing strategy (unit tests, integration fixtures, edge case matrices).
- **Exit Gate**: Explicit user approval of the plan.

### Phase 4: Test-First Implementation (Red Phase)
- **Goal**: Write deterministic tests that define expected behavior before writing feature code.
- **Actions**:
  1. Create test files using the stack's standard test runner (`pytest`, `vitest`, `jest`, `phpunit`).
  2. Write assertions covering the happy path, boundary conditions, and error responses.
  3. Execute the tests to confirm they fail for the expected functional reason (`Red`).
- **Exit Gate**: Verified failing test suite.

### Phase 5: Minimal Feature Implementation (Green Phase)
- **Goal**: Implement clean, minimal code to satisfy the tests.
- **Actions**:
  1. Write implementation logic adhering strictly to project standards (DRY, SOLID, explicit error handling).
  2. Run the test runner continuously until all tests pass (`Green`).
  3. Keep changes laser-focused on the active feature scope.
- **Exit Gate**: 100% passing test suite for newly introduced logic.

### Phase 6: Refactoring & Quality Verification
- **Goal**: Harden the codebase and ensure zero regressions.
- **Actions**:
  1. Run project linters, type checkers, and full regression test suites.
  2. Refactor complex functions, remove code duplicates, and optimize queries (e.g. solve N+1 queries).
  3. Verify responsive UI across viewports (mobile, tablet, desktop) if frontend code is touched.
- **Exit Gate**: Clean linter runs, zero type errors, all tests passing.

### Phase 7: Multi-Vector Review & Atomic Commit
- **Goal**: Final audit before merging.
- **Actions**:
  1. Audit diff against security checks (injection, authz bypass, exposed secrets).
  2. Verify documentation and docstrings are synchronized with code changes.
  3. Stage explicitly declared touchpoint files (`git add <file1> <file2>`).
  4. Create commit following convention: `[#issue_number] <type>(<scope>): <description>`.
