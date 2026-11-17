---
name: agent-development
description: Architectural guidance for designing, configuring, and orchestrating specialized AI subagents. Use when defining new subagents, scoping tool permissions, setting model tiers, or structuring context boundaries.
---

# Agent & Subagent Development Guide

A complete guide for designing, authoring, and orchestrating specialized AI subagent personas with isolated context windows, model tiering, scoped tool permissions, and deterministic handoffs.

---

## 🤖 Subagent Architecture Matrix

| Dimension | Architectural Choices | Best Practice Rationale |
|---|---|---|
| **Role Persona** | Single clear responsibility (e.g. `bmad-pm`, `bmad-architect`, `bmad-dev`, `bmad-tester`) | Prevents role confusion; establishes domain expertise and tone. |
| **Model Tiering** | `pro` vs. `flash` vs. `flash_lite` | Use `pro` for complex reasoning/architecture/LLD; use `flash` for rapid file searches, test runners, and doc updates. |
| **Tool Scoping** | Read-Only vs. Write/Edit vs. Terminal / MCP | Enforce principle of least privilege. Reviewer and Tester agents should never have blanket write access. |
| **Workspace Isolation** | `inherit` vs. `branch` | Use `branch` workspaces to let Developer agents test speculative refactors without polluting the main working branch. |

---

## 📄 Subagent Definition Schema

```yaml
---
name: bmad-dev
role: Senior Software Engineer
description: Specialized developer persona executing TDD implementations in isolated branch workspaces.
model: pro
tools:
  - read_file
  - write_file
  - replace_file_content
  - run_command
workspace: branch
---

# System Prompt

You are Amelia, a Senior Software Engineer specializing in Test-Driven Development (TDD) and clean code architecture.

## Operating Principles
1. **Never write implementation code without a failing test**: Always follow the Red-Green-Refactor lifecycle.
2. **Scope Governance**: You may only touch files explicitly declared in the active sprint story (`agent_docs/stories/active_story.md`).
3. **Run Verification**: Always execute `./dc.sh exec web [test-command]` and verify all tests pass before completing your turn.
```

---

## 🔄 Multi-Agent Handoff & Deliberation Protocols

### 1. Sequential Pipeline Handoff
```
PM (PRD) ──> Analyst (Refinement) ──> Architect (LLD) ──> Dev (TDD) ──> Tester (QA) ──> Reviewer (Security)
```

### 2. Multi-Agent Deliberation (Party Mode)
When resolving high-risk architectural trade-offs:
- Spawn `bmad-architect`, `bmad-dev`, and `bmad-tester` in a shared round-robin turn.
- Architect proposes technical design -> Dev challenges implementation complexity -> Tester flags edge-case testability.
- Output consolidated trade-off consensus note into `docs/adr/`.
