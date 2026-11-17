---
name: bmad-parallel-dev
description: BMAD Accelerated Parallel Development — Multi-agent concurrent execution on isolated git branches powered by dual Gemini Pro accounts and 9Router, adhering strictly to BMAD scope governance, 5-point briefing packets, and 80% coverage gates. Trigger with /bmad-parallel-dev or /parallel.
---

# BMAD Accelerated Parallel Development (`/bmad-parallel-dev`) ⚡

## Purpose
Accelerate delivery velocity by combining **multi-agent parallel execution** with **strict BMAD governance**. Decomposes features into decoupled streams (Frontend, Backend, and Tests) and executes them concurrently across isolated git branches (`Workspace: branch`) leveraging **9Router multi-account load balancing** and **dual Gemini Pro subscriptions**.

---

## Operating Instructions for Orchestrator

Whenever the user invokes `/bmad-parallel-dev` (or `/parallel`):

1. **Step 1: Check Input Mode**:
   - If user gave a prompt directly: **Bob (`bmad-sm`)** instantly logs stories to `task.md` with Vibe Coding estimations.
   - If user says "execute current backlog": Read uncompleted `[ ]` stories in `task.md`.
2. **Step 2: Pre-Lock Scope & Contracts**:
   - **Winston (`bmad-architect`)** locks touchpoint files (`[CREATE]`, `[MODIFY]`) per `@scope-governance.md`.
   - Lock interface contracts (schemas, DTOs, endpoint signatures).
3. **Step 3: Spawn Parallel Subagents**:
   - Execute a single `invoke_subagent` tool call with `Workspace: branch` for:
     - `Amelia (Frontend)` on isolated branch
     - `Amelia (Backend)` on isolated branch
     - `Murat (Test Architect)` on isolated branch
   - Models: Use `"model": "pro"` for developers to leverage Gemini Pro.
4. **Step 4: Integrate Branches**:
   - Merge branches via `git pull --rebase`.
5. **Step 5: Enforce BMAD Gates**:
   - **Murat (`bmad-tester`)**: Verify ≥80% test coverage gate.
   - **Rachel (`bmad-reviewer`)**: 1-pass security & code audit.
   - **Bob (`bmad-sm`)**: Update `task.md` checklist `[x]` with actual delivery time.
