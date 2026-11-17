---
name: scope-governance
description: Procedures and verification checklists for enforcing scope boundaries, managing blast radiuses, and quarantining tangential refactors into backlog issues.
---

# Scope Governance & Boundary Audit Skill 🛡️

## Overview
This skill guides autonomous agents and human engineers in enforcing strict scope containment during task execution, diff preparation, and code reviews.

---

## Workflow Instructions

### 1. Declaring Scope at Task Kickoff
When beginning any task or responding to an issue:
1. Extract the primary functional requirements.
2. Produce a list of **Touchpoint Files** (Files to Create, Modify, or Test).
3. Explicitly list what is **Out-of-Scope**.
4. Include this in the task plan or Briefing Packet.

### 2. Handling Out-of-Scope Discoveries (Change Quarantine)
If while implementing or reviewing you notice:
- Unused code, deprecated syntax, or style issues in an adjacent module.
- An adjacent bug not directly breaking the current feature.
- A missing abstraction that would require refactoring 5 other services.

**Action**:
1. Do NOT modify the adjacent files in this session.
2. Note the issue with file path, line numbers, and impact.
3. Automatically log a GitHub issue or backlog item:
   ```bash
   gh issue create --title "[Refactor/Debt] <Brief description>" --body "..."
   ```
4. Continue with the in-scope task.

### 3. Reviewer Blast-Radius Verification
When running `/bmad-reviewer` or performing self-review:
1. Run `git status` and `git diff --stat`.
2. Ensure no file outside the declared touchpoint list has been modified.
3. If an extra file is modified, verify if it was strictly required. If not, revert changes:
   ```bash
   git checkout -- <unrelated-file>
   ```
