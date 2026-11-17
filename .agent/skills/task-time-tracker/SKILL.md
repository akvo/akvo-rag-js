---
name: task-time-tracker
description: Calculate, analyze, and format total working time, active effort, break intervals, and phase-by-phase time breakdown for development tasks, PRs, and daily sprint logs.
---

# Task Working Time & Active Effort Tracker ⏱️

A specialized skill for accurately measuring, categorizing, and reporting development time across task phases, distinguishing between **Total Clock Time (Elapsed)** and **Active Working Time (Net Effort)**, and documenting concrete accomplishments.

---

## 🎯 When to Use This Skill

Activate this skill when:
- The user asks: *"how long did this task take?"*, *"break down the time spent today"*, or *"count total working time"*.
- Concluding a task, feature branch, or PR submission in **Phase 5: Commit** (`/5-commit`) or **Phase 6: Pull Request** (`/6-pr`).
- Updating `task.md` with actual times for completed user stories.
- Compiling daily engineering timesheets, client billing reports, or sprint velocity reviews.

---

## 📋 The Standard Output Format

Whenever reporting time breakdown, you **MUST** format the response following this exact structure:

```markdown
Here is the breakdown of the actual time spent on this task today (November 4, 2026):

⏱️ Time Overview
- **Start Time**: 12:10 PM (04:10 UTC)
- **Finish / Current Time**: 7:47 PM (11:47 UTC)
- **Total Clock Time (Elapsed)**: ~7 hours 37 minutes
- **Active Working Time**: ~6 hours 20 minutes (excluding ~1h 15m break between 4:05 PM – 5:20 PM)

📋 Detailed Phase Breakdown
| Phase / Activity | Time Window (Local) | Duration | Key Accomplishments |
|---|---|---|---|
| 1. Planning & Research | 12:10 PM – 12:28 PM | ~20m | Branch setup, Figma token extraction, component structure planning (`/0-planning`, `/1-research`). |
| 2. Core Implementation | 12:28 PM – 2:45 PM | ~2h 15m | Built full Academy landing page from scratch: routing, 7 modular components (Hero, About, Roadmap, Methodology, Resources, Testimonials, FAQ, CTA), responsive SCSS, and unit tests (`AcademyLanding.test.js`). |
| 3. Design Refinement — Roadmap & Layout | 2:45 PM – 4:05 PM | ~1h 20m | Hero headline casing, About section grid lock, custom SVG step markers, radar layout, and connector line alignment. |
| **Break / Idle** | 4:05 PM – 5:20 PM | ~1h 15m | Inactive / idle period. |
| 4. Design Refinement — CTA, Resources & Logos | 5:20 PM – 7:15 PM | ~1h 55m | CTA banner typography and ghost button polish, refactored to shared OtherToolsAndResources, and pixel-perfect partner logo alignment (IDH sizing, LICOP "T" & "e" glyph fixes). |
| 5. Quality Gate, PR & CI Pipeline Setup | 7:15 PM – 7:47 PM | ~30m | Roadmap vertical spacing tightening, `/4-verify` suite pass (0 lint errors, 15/15 test suites), GitHub Issue [#844](https://github.com/akvo/IDH-IDC/issues/844) creation, branch alignment (`epic/843-li-academy`, `feature/844-academy-landing-page`), [PR #845](https://github.com/akvo/IDH-IDC/pull/845) submission, and CI test workflow configuration. |
| **Total Active Effort** | | **~6h 20m** | |
```

---

## 🔍 Data Sources for Time Measurement

To ensure accuracy without guessing, retrieve timestamps from one or more of these concrete sources:

### 1. Conversation & Tool Call Transcripts
The primary source of truth for the active session. Check `<appDataDir>/brain/<conversation-id>/.system_generated/logs/transcript.jsonl`.
- Inspect the ISO 8601 `created_at` timestamp of the first user prompt or kickoff action.
- Inspect the timestamp of the latest action.
- Detect idle gaps: any gap between user prompts or agent runs longer than **30–45 minutes** is classified as a `Break / Idle` interval.

### 2. Git Commit History
Run `git log` to inspect commits made on the current branch today:
```bash
git log --since="midnight" --date=iso-strict --format="%ad|%s|%h"
```
- Compare the first commit timestamp with subsequent milestone commits.
- Gaps between commits exceeding 45 minutes without file changes indicate idle/break periods.

### 3. File System Modifications
Inspect file timestamps of key created/modified components:
```bash
stat -f "%Sm: %N" -t "%Y-%m-%d %H:%M:%S" src/components/*
```

---

## 🛠️ Helper Automation Script

A deterministic Python script is bundled with this skill to calculate and generate this exact breakdown:

```bash
# Preview sample format
python3 bmad-team/skills/task-time-tracker/scripts/calculate_work_time.py --sample

# Auto-generate from today's git commits
python3 bmad-team/skills/task-time-tracker/scripts/calculate_work_time.py --git

# Parse with custom idle threshold (default: 45m)
python3 bmad-team/skills/task-time-tracker/scripts/calculate_work_time.py --git --idle-threshold 30

# Generate from a structured JSON file of time windows
python3 bmad-team/skills/task-time-tracker/scripts/calculate_work_time.py --json-input phases.json
```

### JSON Input Format (for `--json-input`)
```json
{
  "phases": [
    {
      "name": "Planning & Research",
      "start": "2026-11-04T12:10:00+08:00",
      "end": "2026-11-04T12:28:00+08:00",
      "accomplishments": "Branch setup, Figma token extraction, component structure planning."
    },
    {
      "name": "Break / Idle",
      "start": "2026-11-04T16:05:00+08:00",
      "end": "2026-11-04T17:20:00+08:00",
      "is_break": true,
      "accomplishments": "Inactive / lunch / idle period."
    }
  ]
}
```

---

## 📐 Calculation Rules & Inviolables

1. **Dual Timezone Clarity**:
   - Always display Start and Finish times in both local time (12-hour `h:mm A`) and UTC (`HH:MM UTC`), e.g.: `12:10 PM (04:10 UTC)`.
2. **Elapsed vs. Active Separation**:
   - `Total Clock Time (Elapsed)` = Finish Time − Start Time.
   - `Active Working Time` = Elapsed Time − Sum(Breaks/Idle).
   - In the overview, explicitly list the break window(s): `(excluding ~1h 15m break between 4:05 PM – 5:20 PM)`.
3. **Concrete Accomplishments Only**:
   - Never write generic summaries like "Worked on frontend".
   - Include specific artifacts, files, test results, PR links, and issue numbers.
4. **Rounding Consistency**:
   - Round individual phase durations to the nearest 5 minutes (or exact minute for short <20m phases).
   - Ensure the sum of phase durations + breaks equals the total elapsed clock time.
