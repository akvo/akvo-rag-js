---
name: command-development
description: Guide for creating, structuring, and testing slash commands and task workflows. Use when defining custom slash commands, setting up dynamic arguments, or structuring interactive prompts.
---

# Slash Command & Workflow Development

A comprehensive guide for authoring, configuring, and testing reusable slash commands (`/command`) and standardized workflow definitions (`.agent/workflows/*.md`).

---

## 🛠️ Slash Command Architecture & YAML Frontmatter

```markdown
---
description: Run the automated Red-Green-Refactor implementation cycle for an active story.
argument_hint: "[story_id]"
allowed_tools:
  - read_file
  - write_file
  - replace_file_content
  - run_command
---

# 2. Implementation Workflow

## Objective
Implement the feature defined in the active story following strict Test-Driven Development (TDD).

## Parameters
- Story File: `agent_docs/stories/{story_id}.md` (Defaults to `agent_docs/stories/active_story.md` if omitted).

## Execution Sequence
1. **Pre-Flight Verification**:
   - Verify that the story file exists and has explicit acceptance criteria.
   - Halt immediately if acceptance criteria are missing.
2. **Red Phase (Failing Test)**:
   - Create test file in `tests/` covering the acceptance criteria.
   - Execute test runner via `./dc.sh exec web npm test` to confirm test fails.
3. **Green Phase (Implementation)**:
   - Implement minimal required code in `src/`.
   - Re-run test runner until all tests pass.
4. **Refactor & Linter Check**:
   - Run code formatter and type checks.
```

---

## 💡 Workflow Design Principles

1. **Pre-Flight Sanity Checks**: Step 1 should always verify preconditions (e.g. prerequisite LLD exists, database container is running).
2. **Deterministic Tool Calls**: Explicitly name wrapper commands (`./dc.sh exec web ...`) so the AI does not attempt uncontainerized host commands.
3. **Clear Transition Criteria**: Provide clear exit statements explaining what artifacts to update before concluding the workflow.
