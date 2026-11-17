---
trigger: model_decision
description: BMAD Coding Standards — DRY, KISS, YAGNI, TDD, SOC, BDUF, SOLID. Load when implementing or reviewing technical designs.
---

# BMAD Coding Standards

## 1. Core Principles

| Acronym | Rule | Action |
|---------|------|--------|
| **DRY** | Don't Repeat Yourself | Extract duplicated logic into functions/modules |
| **KISS** | Keep It Simple | Avoid over-engineering; simplify if unsure |
| **YAGNI** | You Aren't Gonna Need It | Only implement what's needed now, not "future" features |
| **TDD** | Test-Driven Development | Write failing test first → make it pass → refactor |
| **SOC** | Separation of Concerns | One function/class = one responsibility |
| **BDUF** | Avoid Big Design Up Front | Start small, iterate; design only for the current phase |

---

## 2. SOLID Principles

| Letter | Principle | Check |
|--------|-----------|-------|
| **S** | Single Responsibility | If function name has "And", it's likely breaking SRP |
| **O** | Open-Closed | Add behavior via extension, not by modifying existing code |
| **L** | Liskov Substitution | Subclasses must satisfy same contracts as base |
| **I** | Interface Segregation | No client forced to depend on methods it doesn't use |
| **D** | Dependency Inversion | Inject dependencies; don't hardcode implementations |

---

## 3. Readability, Formatting & Akvo Standards

- **Formatting (Akvo Standard)**:
  - **JS / TS**: Prettier with `tabWidth: 2`, `semi: true`, `singleQuote: true`, `printWidth: 80`, `trailingComma: "es5"`, `singleAttributePerLine: true`. Use `camelCase` and `===` strict equality.
  - **Python**: Black & Flake8 with `line-length = 79`, 4-space indentation, `lowercase_with_underscores` naming, relative intra-package imports.
- **Naming**: Use full, descriptive names (`calculateTotal` not `calcTot`). No `temp` or `data` unless scope is ≤2 lines.
- **Comments**: Explain the *why*, not the *how*. Code should be self-explanatory.
- **Magic Values**: Replace hardcoded strings/numbers with named constants or enums.
- **Error Handling**: Use explicit exceptions with meaningful messages; never return error strings or swallow exceptions in empty catch blocks.
- **Security**: Validate and sanitize all user inputs (XSS, SQL injection). Use framework protections.
- **FIRST Tests & 80% Coverage Gate**: Tests must be Fast, Independent, Repeatable, Self-validating, Timely. **All repositories must achieve and maintain a minimum of 80% code coverage** (per Akvo Tech KPI).

---

## 4. Universal Anti-Pattern Prevention 🚫

### A. Adapter-First Pattern (No Cloned Parallel Handlers)
- When extending any service, router, or workflow to support a new entity variant, source format, or third-party SDK, **NEVER copy-paste parallel handler functions**.
- Extract an **Adapter / Strategy** layer to normalize input into a common domain contract before calling business logic.

### B. Centralized Enums & Variant Sets (No Scattered Ad-Hoc Checks)
- **NEVER** scatter compound variant checks (e.g. `type === 'A' || type === 'B'`) across multiple files.
- Define a single centralized `Set` or `Enum` constant in the domain constants module (e.g., `VALID_TYPES = new Set(['A', 'B'])`) and use membership checks (`.has()`, `in`).

### C. Hard Ban on Unbatched I/O in Loops ($O(1)$ Round-Trip Invariant)
- **NEVER** execute external operations (database queries, network requests, filesystem reads, or RPC calls) inside iteration loops (`for`, `while`, `map`, `forEach`).
- Always use bulk queries (`IN (...)`), batched API requests, or single-pass annotated data transformations to guarantee constant $O(1)$ round-trip complexity.

---

## 5. Mandatory Validation Checklist

Before finalizing any implementation:
- [ ] DRY, KISS, YAGNI, SOC, TDD followed
- [ ] SOLID: SRP, OCP, LSP, ISP, DIP respected
- [ ] **Adapter-First**: No duplicate parallel execution paths cloned for new variants
- [ ] **Centralized Enums**: No scattered inline compound checks repeated across files
- [ ] **Batched I/O**: Zero database queries, HTTP calls, or file reads inside loops
- [ ] Descriptive naming, no magic values, Akvo Prettier/Black formatting
- [ ] Graceful error handling with explicit exceptions, inputs sanitized
- [ ] All automated tests passing with **minimum 80% test coverage**


