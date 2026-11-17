---
name: bmad-retrospective
description: Skill for running team retrospectives, analyzing development session logs, extracting actionable DOs/DONTs, and synthesizing project-agnostic rules.
---

# BMAD Retrospective Skill 🔄

## Overview
This skill guides agents in running post-iteration retrospectives, diagnosing process friction, and formalizing new operational guidelines into the agent codebase.

---

## Retrospective Protocol

1. **Trigger Condition**: Run after finishing a major feature, experiencing difficult multi-turn debugging sessions, or encountering external review feedback.
2. **Review Vectors**:
   - **Scope Discipline**: Were any out-of-scope files edited? Did scope drift occur?
   - **Token Efficiency**: Were subagent prompts concise? Did context dumping happen?
   - **Contract Integrity**: Did unit tests fail on integration due to stale mocks?
   - **Code Cleanliness**: Was logic duplicated across handlers? Were external operations batched?
3. **Artifact Generation**:
   - Create or update the retrospective synthesis note.
   - Propose direct updates to `bmad-team/rules/` and `bmad-team/skills/` to prevent recurrence.
