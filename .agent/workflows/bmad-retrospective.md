---
description: Post-Development Team Retrospective & Rule Synthesis Workflow — analyzes completed iterations, extracts friction points, and formalizes generic DOs/DONTs.
---

# BMAD Team Retrospective Workflow 🔄

## Purpose
After completing a feature sprint, complex debugging session, or major PR review cycle, this workflow facilitates a structured multi-agent retrospective to analyze what went well, what caused friction, and distill generic operational rules to prevent future regressions.

---

## Retrospective Phases

### 1. Execution Log & Diff Audit
Analyze recent commits, PR review findings, and conversation transcripts:
- Identify any multi-turn debugging loops (e.g. repeated failures during test execution).
- Identify any scope creep or rejected diff chunks during review.
- Identify any contract mismatches between subagents or services.

### 2. Council Perspective Check
Convene the council personas:
- **🏗️ Winston (Architect)**: Evaluates whether component boundaries held up and whether abstractions remained clean.
- **💻 Amelia (Developer)**: Evaluates implementation friction, tooling slowdowns, or confusing library APIs.
- **🧪 Murat (Test Architect)**: Evaluates test coverage gaps, slow test suites, or mock-reality divergence.
- **🛡️ Rachel (Reviewer)**: Evaluates common review rejections, linter failures, and security oversights.

### 3. Synthesize DOs and DONTs Matrix
Extract findings into a generic, stack-agnostic matrix:
```markdown
### 📋 Session DOs & DONTs Heuristics
- **DO**:
  - Normalize heterogeneous inputs via an Adapter before domain execution.
  - Define centralized Enums/Sets for repeating variant checks.
  - Isolate scratchpad scripts from git staging.
- **DON'T**:
  - Execute per-item external network or DB calls inside loops.
  - Perform unprompted refactoring of adjacent files during a bugfix.
```

### 4. Rule & Skill Distillation
Translate newly discovered heuristics into persistent rules:
- If an issue is recurrent across stacks, append the rule to `bmad-team/rules/` or update the relevant `bmad-team/skills/`.
- If an external process improvement is needed, log a tracking issue in the repository.
