---
description: Calculate, analyze, and format the actual time spent on the current task or daily development session.
---

# Time Tracking & Active Effort Report ⏱️

## Purpose
This workflow generates an accurate, phase-by-phase breakdown of time spent on the current task or sprint story. It computes total elapsed clock time, identifies idle/break windows, and highlights concrete accomplishments per phase.

---

## Steps

### 1. Collect Session Timestamps
- Retrieve the start timestamp from the first task prompt, git branch creation, or transcript logs (`transcript.jsonl`).
- Retrieve the current or completion timestamp.
- Gather milestone timestamps from git commits:
  ```bash
  git log --since="midnight" --date=iso-strict --format="%ad|%s|%h"
  ```

### 2. Identify Phases & Idle Breaks
- Group activities into logical development phases (e.g., Planning & Research, Core Implementation, Design Refinement, Testing & Verification, PR Submission).
- Any gap exceeding **30–45 minutes** without active commits or tool executions is marked as a **Break / Idle** period.

### 3. Compute Elapsed vs. Active Effort
- **Total Clock Time (Elapsed)**: End Time − Start Time.
- **Active Working Time**: Total Clock Time − Total Break Duration.

### 4. Output Breakdown Report
Present the report matching the standard output format:

```markdown
Here is the breakdown of the actual time spent on this task today ([Date]):

⏱️ Time Overview
- **Start Time**: [h:mm A] ([HH:MM] UTC)
- **Finish / Current Time**: [h:mm A] ([HH:MM] UTC)
- **Total Clock Time (Elapsed)**: ~[X] hours [Y] minutes
- **Active Working Time**: ~[X] hours [Y] minutes (excluding ~[Z] break between [Start] – [End])

📋 Detailed Phase Breakdown
| Phase / Activity | Time Window (Local) | Duration | Key Accomplishments |
|---|---|---|---|
| 1. [Phase Name] | [Time Window] | ~[Duration] | [Key Accomplishments, files, tests] |
| **Break / Idle** | [Time Window] | ~[Duration] | Inactive / idle period. |
| 2. [Phase Name] | [Time Window] | ~[Duration] | [Key Accomplishments, PR, CI] |
| **Total Active Effort** | | **~[X]h [Y]m** | |
```

### 5. Update Task Documentation (Optional)
If `task.md` is active in the workspace, update the actual time column for the corresponding task:
```markdown
| Task ID | Story Description | Vibe Coding | Testing | QA & Review | Total Est. | Actual Time |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **TASK-01** | ... | ... | ... | ... | 60m | **~[Actual]** |
```
