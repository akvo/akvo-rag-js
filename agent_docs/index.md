# Project Index: akvo-rag-js

This is the master index for all project documentation and agent artifacts managed by the BMAD team.

## Project Resources

- [README](../README.md): Project overview and setup instructions.
- [GEMINI.md](./GEMINI.md): Project memory and context tracking.

## Agent Documentation

### Product Management (PM)
- [10 - Fix Spacing Issues](./features/10-fix-spacing-issues.md): Requirements for fixing mid-word spacing in chat responses.
- [Enhanced Markdown Support](./features/markdown-rendering-support.md): Requirements for beautiful and secure markdown element styling.
- [Test Suite Integration](./features/test-suite-integration.md): Formalizing automated verification within the codebase.




### Business Analyst (Analyst)
- [Research Findings: Bug Audit](./research-findings.md): Comprehensive analysis of potential codebase bugs.
- [Research Findings: Markdown](./research-findings-markdown.md): Analysis of requirements for enhanced markdown rendering.
- [Research Findings: Test Suite](./research-findings-test-suite.md): Analysis of testing infrastructure and requirements.




### Architecture (Architect)
- [Architecture Overview](./architecture.md): High-level system design and data flow.
- [Architecture: Markdown](./architecture-markdown.md): Design for scoped reset and markdown component structure.
- [Architecture: Test Suite](./architecture-test-suite.md): Design for automated testing infrastructure.
- [ADR-001: Streaming Text Concatenation](./adrs/ADR-001-streaming-text-concatenation.md): Decision to use direct chunk concatenation.
- [ADR-002: Markdown Styling Isolation](./adrs/ADR-002-markdown-styling-isolation.md): Decision to use scoped reset for CSS isolation.
- [ADR-003: Test Suite Architecture](./adrs/ADR-003-test-suite-architecture.md): Decision to use Node.js native test runner.
- [ADR-004: Component Instance Pattern](./adrs/ADR-004-component-instance-pattern.md): Decision to use class-based state isolation.
- [ADR-005: Exponential Backoff](./adrs/ADR-005-exponential-backoff.md): Decision to use resilient reconnection strategy.




### UX Design (UX)
- *No artifacts yet.*

### Sprint Planning (SM)
- [Sprint Plan](./sprint-plan.md): Current sprint goals and stories.
- [STORY-011: Component Refactor](./stories/STORY-011-component-refactor.md): Requirements for instance-based pattern.
- [STORY-012: Resilience](./stories/STORY-012-exponential-backoff.md): Requirements for exponential backoff.
- [STORY-013: Performance](./stories/STORY-013-rendering-optimization.md): Requirements for rendering optimization.




### Implementation (Dev)
- **Sprint 1 Complete**: All features implemented using ESM and validated against the new test suite.

### Testing (Tester)
- [Test Strategy](./test-strategy.md): Risk assessment and verification strategy for the widget.

### Documentation (Writer)
- **README Updated**: Finalized with premium features and technical stack details.
- [Release Workflow](../.agent/workflows/release.md): Documentation for the automated release process.
- **Walkthrough Created**: Full summary of Sprint 1 results.

---
*Last updated: 2026-03-09*
