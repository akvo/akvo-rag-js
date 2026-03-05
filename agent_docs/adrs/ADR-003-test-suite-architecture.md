# ADR-003: Test Suite Architecture

- **Status**: Proposed
- **Context**:
  The project currently lacks a formal testing framework. Verification is done via ad-hoc scripts in `/tmp/`. To ensure long-term maintainability, we need a standard way to run tests.

- **Decision**:
  We will use the **Node.js native test runner** (`node --test`) located in a new `/tests` directory.
  - Tests will be written in Javascript.
  - Test files will follow the `.test.js` naming convention.
  - A `test` script will be added to `package.json`.

- **Alternatives Considered**:
  1. **Jest**: Feature-rich but adds significant weight (~50MB+ node_modules).
  2. **Vitest**: Excellent for modern JS but requires a build tool integration that might be overkill for two utility files.
  3. **Mocha/Chai**: Classic but requires multiple dependencies for assertions.

- **Consequences**:
  - Zero new dependencies (if using Node 18+).
  - Fast execution.
  - Standardized location for all verification logic.
  - Simple `npm test` workflow for developers.
