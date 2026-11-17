#!/usr/bin/env python3
"""
calculate_work_time.py — Precise Task Working Time & Active Effort Calculator

Parses development activity (git commits, conversation transcript, or structured JSON),
computes exact elapsed clock time, detects idle/break intervals, and outputs a formatted
breakdown with time windows, durations, and key accomplishments.

Usage:
  python3 calculate_work_time.py --sample
  python3 calculate_work_time.py --git
  python3 calculate_work_time.py --transcript /path/to/transcript.jsonl
  python3 calculate_work_time.py --json-input phases.json
"""

import sys
import os
import json
import argparse
import subprocess
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional, Tuple


def format_duration(seconds: float, verbose: bool = False) -> str:
    """Format duration in seconds into human-readable '~X hours Y minutes' or '~Xh Ym'."""
    total_minutes = int(round(seconds / 60))
    hours = total_minutes // 60
    minutes = total_minutes % 60

    if verbose:
        parts = []
        if hours > 0:
            parts.append(f"{hours} hour{'s' if hours != 1 else ''}")
        if minutes > 0 or not parts:
            parts.append(f"{minutes} minute{'s' if minutes != 1 else ''}")
        return "~" + " ".join(parts)
    else:
        if hours > 0 and minutes > 0:
            return f"~{hours}h {minutes}m"
        elif hours > 0:
            return f"~{hours}h"
        else:
            return f"~{minutes}m"


def format_time_local_and_utc(dt: datetime) -> Tuple[str, str]:
    """Return local 12-hour formatted time and UTC formatted time."""
    # Local format: 12:10 PM or 7:47 PM
    local_str = dt.strftime("%-I:%M %p")
    # UTC equivalent: 04:10 UTC or 11:47 UTC
    utc_dt = dt.astimezone(timezone.utc)
    utc_str = utc_dt.strftime("%H:%M UTC")
    return local_str, utc_str


def generate_markdown_report(
    phases: List[Dict[str, Any]],
    report_date: Optional[datetime] = None,
    task_name: Optional[str] = None
) -> str:
    """
    Generate markdown report matching the exact structure:
    - Date heading
    - ⏱️ Time Overview (Start, Finish, Total Clock Time, Active Working Time with break note)
    - 📋 Detailed Phase Breakdown table
    - Total Active Effort row
    """
    if not phases:
        return "No activity recorded for this period."

    # Parse and sort phases by start datetime
    sorted_phases = sorted(phases, key=lambda x: x["start_dt"])
    start_dt = sorted_phases[0]["start_dt"]
    finish_dt = sorted_phases[-1]["end_dt"]

    if report_date is None:
        report_date = start_dt

    date_str = report_date.strftime("%B %-d, %Y")

    total_clock_seconds = (finish_dt - start_dt).total_seconds()
    total_break_seconds = 0
    active_working_seconds = 0
    breaks_summary = []

    for p in sorted_phases:
        duration_sec = (p["end_dt"] - p["start_dt"]).total_seconds()
        p["duration_sec"] = duration_sec
        is_break = p.get("is_break", False) or "break" in p.get("name", "").lower() or "idle" in p.get("name", "").lower()
        p["is_break"] = is_break

        if is_break:
            total_break_seconds += duration_sec
            b_start, _ = format_time_local_and_utc(p["start_dt"])
            b_end, _ = format_time_local_and_utc(p["end_dt"])
            b_dur = format_duration(duration_sec, verbose=False)
            breaks_summary.append(f"{b_dur} break between {b_start} – {b_end}")
        else:
            active_working_seconds += duration_sec

    start_local, start_utc = format_time_local_and_utc(start_dt)
    finish_local, finish_utc = format_time_local_and_utc(finish_dt)

    total_clock_str = format_duration(total_clock_seconds, verbose=True)
    active_work_str = format_duration(active_working_seconds, verbose=True)
    active_work_compact = format_duration(active_working_seconds, verbose=False)

    lines = []
    task_prefix = f" on this task" if not task_name else f" on {task_name}"
    lines.append(f"Here is the breakdown of the actual time spent{task_prefix} today ({date_str}):\n")
    lines.append("⏱️ Time Overview")
    lines.append(f"- **Start Time**: {start_local} ({start_utc})")
    lines.append(f"- **Finish / Current Time**: {finish_local} ({finish_utc})")
    lines.append(f"- **Total Clock Time (Elapsed)**: {total_clock_str}")

    if breaks_summary:
        break_note = f" (excluding ~" + ", ".join(breaks_summary).replace("~", "") + ")"
    else:
        break_note = ""
    lines.append(f"- **Active Working Time**: {active_work_str}{break_note}\n")

    lines.append("📋 Detailed Phase Breakdown")
    lines.append("| Phase / Activity | Time Window (Local) | Duration | Key Accomplishments |")
    lines.append("|---|---|---|---|")

    phase_counter = 1
    for p in sorted_phases:
        p_start, _ = format_time_local_and_utc(p["start_dt"])
        p_end, _ = format_time_local_and_utc(p["end_dt"])
        window = f"{p_start} – {p_end}"
        dur_str = format_duration(p["duration_sec"], verbose=False)
        accomplishments = p.get("accomplishments", "").strip()

        if p["is_break"]:
            lines.append(f"| **Break / Idle** | {window} | {dur_str} | {accomplishments or 'Inactive / idle period.'} |")
        else:
            # Auto-number if not already numbered
            name = p["name"]
            if not name.strip().startswith(tuple(f"{i}." for i in range(1, 20))):
                title = f"{phase_counter}. {name}"
                phase_counter += 1
            else:
                title = name
            lines.append(f"| {title} | {window} | {dur_str} | {accomplishments} |")

    lines.append(f"| **Total Active Effort** | | **{active_work_compact}** | |")

    return "\n".join(lines)


def run_sample():
    """Generates the reference output matching the user's specification."""
    # November 4, 2026 UTC+8
    tz_gmt8 = timezone(timedelta(hours=8))
    base_date = datetime(2026, 11, 4, tzinfo=tz_gmt8)

    def make_dt(hour, minute):
        return datetime(2026, 11, 4, hour, minute, tzinfo=tz_gmt8)

    phases = [
        {
            "name": "Planning & Research",
            "start_dt": make_dt(12, 10),
            "end_dt": make_dt(12, 28),
            "accomplishments": "Branch setup, Figma token extraction, component structure planning (`/0-planning`, `/1-research`)."
        },
        {
            "name": "Core Implementation",
            "start_dt": make_dt(12, 28),
            "end_dt": make_dt(14, 45),
            "accomplishments": "Built full Academy landing page from scratch: routing, 7 modular components (Hero, About, Roadmap, Methodology, Resources, Testimonials, FAQ, CTA), responsive SCSS, and unit tests (`AcademyLanding.test.js`)."
        },
        {
            "name": "Design Refinement — Roadmap & Layout",
            "start_dt": make_dt(14, 45),
            "end_dt": make_dt(16, 5),
            "accomplishments": "Hero headline casing, About section grid lock, custom SVG step markers, radar layout, and connector line alignment."
        },
        {
            "name": "Break / Idle",
            "start_dt": make_dt(16, 5),
            "end_dt": make_dt(17, 20),
            "is_break": True,
            "accomplishments": "Inactive / idle period."
        },
        {
            "name": "Design Refinement — CTA, Resources & Logos",
            "start_dt": make_dt(17, 20),
            "end_dt": make_dt(19, 15),
            "accomplishments": "CTA banner typography and ghost button polish, refactored to shared OtherToolsAndResources, and pixel-perfect partner logo alignment (IDH sizing, LICOP \"T\" & \"e\" glyph fixes)."
        },
        {
            "name": "Quality Gate, PR & CI Pipeline Setup",
            "start_dt": make_dt(19, 15),
            "end_dt": make_dt(19, 47),
            "accomplishments": "Roadmap vertical spacing tightening, `/4-verify` suite pass (0 lint errors, 15/15 test suites), GitHub Issue [#844](https://github.com/akvo/IDH-IDC/issues/844) creation, branch alignment (`epic/843-li-academy`, `feature/844-academy-landing-page`), [PR #845](https://github.com/akvo/IDH-IDC/pull/845) submission, and CI test workflow configuration."
        }
    ]

    report = generate_markdown_report(phases, report_date=base_date)
    print(report)


def parse_git_commits(
    since_date: Optional[str] = "midnight",
    branch: Optional[str] = "HEAD",
    idle_threshold_minutes: int = 45
) -> List[Dict[str, Any]]:
    """Extract commits from git log and group them into phases and idle breaks."""
    cmd = ["git", "log", branch, f"--since={since_date}", "--date=iso-strict", "--format=%ad|%s|%h"]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    except Exception as e:
        print(f"Error running git log: {e}", file=sys.stderr)
        return []

    lines = [line.strip() for line in res.stdout.strip().split("\n") if line.strip()]
    if not lines:
        return []

    commit_items = []
    for l in lines:
        parts = l.split("|", 2)
        if len(parts) == 3:
            dt_iso, subject, hash_val = parts
            dt = datetime.fromisoformat(dt_iso)
            commit_items.append({"dt": dt, "subject": subject, "hash": hash_val})

    # Sort chronological
    commit_items.sort(key=lambda x: x["dt"])

    if not commit_items:
        return []

    # Cluster commits into phases: break gap if interval between commits > idle_threshold_minutes
    phases = []
    current_phase_start = commit_items[0]["dt"]
    current_commits = [commit_items[0]]

    for i in range(1, len(commit_items)):
        prev_item = commit_items[i - 1]
        curr_item = commit_items[i]
        gap_minutes = (curr_item["dt"] - prev_item["dt"]).total_seconds() / 60.0

        if gap_minutes > idle_threshold_minutes:
            # Close previous phase
            phases.append({
                "name": f"Activity Phase ({len(current_commits)} commits)",
                "start_dt": current_phase_start,
                "end_dt": prev_item["dt"],
                "accomplishments": "; ".join(c["subject"] for c in current_commits)
            })
            # Insert break
            phases.append({
                "name": "Break / Idle",
                "start_dt": prev_item["dt"],
                "end_dt": curr_item["dt"],
                "is_break": True,
                "accomplishments": "Inactive / idle period."
            })
            current_phase_start = curr_item["dt"]
            current_commits = [curr_item]
        else:
            current_commits.append(curr_item)

    if current_commits:
        phases.append({
            "name": f"Implementation & Finalization",
            "start_dt": current_phase_start,
            "end_dt": current_commits[-1]["dt"],
            "accomplishments": "; ".join(c["subject"] for c in current_commits)
        })

    return phases


def main():
    parser = argparse.ArgumentParser(description="Calculate Task Working Time & Active Effort")
    parser.add_argument("--sample", action="store_true", help="Print the reference sample report")
    parser.add_argument("--git", action="store_true", help="Auto-detect activity from git commits")
    parser.add_argument("--since", default="midnight", help="Git log since filter (default: midnight)")
    parser.add_argument("--branch", default="HEAD", help="Git branch to inspect (default: HEAD)")
    parser.add_argument("--idle-threshold", type=int, default=45, help="Minutes of inactivity to consider a break (default: 45)")
    parser.add_argument("--json-input", help="Path to JSON file containing structured phases")

    args = parser.parse_args()

    if args.sample:
        run_sample()
        return

    phases = []
    if args.json_input:
        with open(args.json_input, "r") as f:
            data = json.load(f)
            raw_phases = data.get("phases", data)
            for p in raw_phases:
                start_dt = datetime.fromisoformat(p["start"])
                end_dt = datetime.fromisoformat(p["end"])
                phases.append({
                    "name": p.get("name", "Work Phase"),
                    "start_dt": start_dt,
                    "end_dt": end_dt,
                    "is_break": p.get("is_break", False),
                    "accomplishments": p.get("accomplishments", "")
                })
        print(generate_markdown_report(phases))
        return

    if args.git:
        phases = parse_git_commits(
            since_date=args.since,
            branch=args.branch,
            idle_threshold_minutes=args.idle_threshold
        )
        if not phases:
            print("No commits found for the specified period. Try --sample or specify --since.")
            return
        print(generate_markdown_report(phases))
        return

    # Default to sample if no flag given
    run_sample()


if __name__ == "__main__":
    main()
