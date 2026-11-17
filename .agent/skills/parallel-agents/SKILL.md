---
name: parallel-agents
description: Decomposes coding features and tasks into concurrent subagents running in parallel on isolated git branches using 9Router and dual Gemini Pro accounts. Trigger with /parallel or when user requests parallel execution of AI agents.
---

# Parallel Agents Execution Engine (`/parallel`) ⚡

This skill enables Antigravity to act as a **Multi-Agent Orchestrator**, decomposing complex coding missions into independent streams and executing them **simultaneously in parallel** using native background subagents on isolated git branches (`Workspace: branch`).

---

## Architecture & Concurrent Flow

```
                      [User Mission Brief: /parallel]
                                     │
                                     ▼
                      [Phase 0: Orchestrator / Lead]
                        1. Decompose into modules
                        2. Lock API & data contracts
                        3. Isolate file touchpoints
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           │                         │                         │
           ▼ (Concurrent)            ▼ (Concurrent)            ▼ (Concurrent)
  [Frontend Subagent]        [Backend Subagent]        [QA/Test Subagent]
  • Role: Dev (UI/Client)    • Role: Dev (API/DB)      • Role: Test Architect
  • Workspace: branch        • Workspace: branch       • Workspace: branch
  • Gemini Pro #1            • Gemini Pro #2           • Gemini Pro (Shared)
  • Output: Components       • Output: Routes & SQL    • Output: Pytest/Jest
           │                         │                         │
           └─────────────────────────┼─────────────────────────┘
                                     │
                                     ▼
                      [Phase 2: Synthesis & Integration]
                        1. Automatic branch merge
                        2. Verification & test runner
                        3. Final review report
```

---

## Orchestrator Execution Steps

Whenever the user invokes `/parallel` or requests parallel development:

### Step 1: Rapid Task Slicing & Boundary Locking
1. Inspect the user request and determine the independent streams:
   - **Stream A (UI / Client)**: Pages, components, state management, client validation.
   - **Stream B (API / Server)**: Database schemas, models, controllers/routes, external services.
   - **Stream C (Tests & QA)**: Mock fixtures, unit test suites, integration tests.
2. Formulate the **Interface Contract** (endpoint signatures, request/response JSON schemas) before dispatching so neither subagent conflicts with the other.

### Step 2: Spawn Parallel Subagents in a Single Turn
Launch the subagents concurrently using `invoke_subagent` with `Workspace: "branch"`:

```json
[
  {
    "TypeName": "bmad-dev",
    "Role": "Amelia (Frontend Engineer)",
    "Workspace": "branch",
    "Prompt": "Implement UI for: [Task Details]. Use API Contract: [Contract]. Write passing component tests."
  },
  {
    "TypeName": "bmad-dev",
    "Role": "Alex (Backend Engineer)",
    "Workspace": "branch",
    "Prompt": "Implement REST API for: [Task Details]. Follow schema: [Contract]. Write endpoint tests."
  },
  {
    "TypeName": "bmad-tester",
    "Role": "Murat (QA Engineer)",
    "Workspace": "branch",
    "Prompt": "Generate comprehensive unit test suite & edge-case tests based on contract: [Contract]."
  }
]
```

### Step 3: Synthesis & Verification
1. As each subagent completes its work on its background branch, review its change summary.
2. Merge the branches into the main workspace.
3. Run test runner (e.g., `pytest`, `npm test`, or `cargo test`) to ensure end-to-end compatibility.
4. Present a consolidated diff & progress report to the user.

---

## Best Practices
- **No Overlapping Touchpoints**: Ensure Subagent A and Subagent B do not modify the exact same files simultaneously to prevent merge conflicts.
- **Contract First**: Always specify function signatures / API paths before launching parallel coders.
- **9Router Integration**: All LLM calls automatically route through 9Router, utilizing the user's dual Gemini Pro subscriptions with active load balancing and token compression.
