---
name: pr-review-toolkit
description: Multi-vector code review toolkit for comprehensive pull request audits. Use when conducting deep code reviews, analyzing regression risks, auditing type safety, detecting silent errors, or reviewing documentation.
---

# PR Review Toolkit: The 6-Vector Audit Framework

An exhaustive code review suite bundling 6 specialized review perspectives to catch defects, security vulnerabilities, regression risks, and maintainability debt before code is merged.

---

## 🔍 The 6 Specialized Review Personas

### 1. Silent Failure & Error Handling Auditor (`silent-failure-detector`)
**Primary Mission**: Catch swallowed exceptions, unhandled promises, and silent data corruptions.

* **Checklist**:
  - [ ] **No Empty Catch Blocks**: Flag any `catch (e) {}` or `except: pass` that discards errors without logging or metric increments.
  - [ ] **Unhandled Promise Rejections**: Ensure all asynchronous promises have proper `.catch()` or are wrapped in `try/catch`.
  - [ ] **Actionable Error Propagation**: Ensure errors include relevant identifiers (e.g. `userId`, `orderId`) rather than generic string messages.
  - [ ] **Correct Status Codes**: Check that API endpoints return appropriate HTTP status codes (`400`, `401`, `403`, `404`, `409`, `422`, `500`).

---

### 2. Type Design & Invariant Auditor (`type-design-auditor`)
**Primary Mission**: Enforce strict type invariants and make illegal states unrepresentable.

* **Checklist**:
  - [ ] **No Unsafe Type Casting**: Flag dangerous uses of `any`, `unknown as Type`, or untyped dictionary/map access.
  - [ ] **Discriminated Unions**: Verify that multi-state entities (e.g. `Loading | Success | Error`) use explicit tag discriminators.
  - [ ] **Strict Null & Undefined Handling**: Verify that optional properties (`?`) are safely accessed using optional chaining (`?.`) or nullish coalescing (`??`).
  - [ ] **External Contract Validation**: Ensure data received from external webhooks or APIs is validated at runtime (e.g. via Zod or Pydantic) before being cast to internal types.

---

### 3. Test Gap & Coverage Analyzer (`pr-test-analyzer`)
**Primary Mission**: Verify that all new business logic and edge cases have matching, deterministic test assertions.

* **Checklist**:
  - [ ] **Branch Coverage**: Verify that new `if/else`, `switch`, or ternary conditions have tests for each branch.
  - [ ] **Error Path Verification**: Ensure tests exist for failure scenarios (e.g., duplicate email registration, expired session token).
  - [ ] **Test Determinism**: Prohibit tests that rely on real wall-clock time (`setTimeout`), live third-party network APIs, or uncontrolled random seeds without mock fixtures.
  - [ ] **Meaningful Assertions**: Reject tests that only verify HTTP 200 without checking response payload integrity.

---

### 4. Code Quality & Architectural Integrity (`code-quality-reviewer`)
**Primary Mission**: Maintain SOLID principles, prevent DRY violations, and enforce project boundaries.

* **Checklist**:
  - [ ] **Scope Containment**: Flag any out-of-scope refactoring or tangential file modifications that do not belong to the active PR.
  - [ ] **DRY Enforcement**: Ensure shared logic is extracted to common utilities rather than copy-pasted across modules.
  - [ ] **Layered Separation**: Verify that UI components do not execute raw SQL queries, and database controllers do not format presentation markup.

---

### 5. Code Simplification & Complexity Reducer (`code-simplifier`)
**Primary Mission**: Eliminate accidental complexity, premature abstractions, and dead code.

* **Checklist**:
  - [ ] **Premature Abstractions**: Challenge unnecessary factory classes, overly generic wrapper interfaces, or deep inheritance hierarchies.
  - [ ] **Dead Code Removal**: Flag unused imports, commented-out legacy code blocks, or obsolete helper functions.
  - [ ] **Cognitive Complexity**: Recommend early returns (`guard clauses`) to flatten deeply nested `if/else` ladders.

---

### 6. Comment & Documentation Auditor (`comment-analyzer`)
**Primary Mission**: Prevent comment rot and ensure code-to-doc synchronicity.

* **Checklist**:
  - [ ] **Why vs. What**: Ensure comments explain the *rationale* and domain constraints, not obvious code syntax.
  - [ ] **Signature Sync**: Verify that `@param`, `@returns`, and docstrings accurately match updated function signatures.
  - [ ] **Outdated Assumptions**: Flag comments that reference deprecated systems, old ticket numbers, or obsolete business rules.
