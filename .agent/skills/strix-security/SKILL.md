---
name: strix-security
description: Autonomous AI penetration testing, exploit validation, and vulnerability remediation using Strix CLI and agent skills.
---

# Strix: Autonomous AI Penetration Testing & Security

A specialized guide for running autonomous security assessments, validating vulnerabilities with real Proof-of-Concept (PoC) exploits, and remediating high-risk issues with coding agents.

---

## 🎯 Core Capabilities

1. **Active Exploitation & Verification**: Unlike static linters (SAST) that generate theoretical warnings, Strix tests applications dynamically to verify whether a vulnerability is truly exploitable before reporting it.
2. **OWASP Top 10 Coverage**: Tests for SQLi, XSS, Broken Object-Level Authorization (BOLA/IDOR), SSRF, CSRF, sensitive data exposure, and broken authentication.
3. **AI Fix Generation**: Automatically outputs remediation diffs and tailored AI fix prompts to refactor vulnerable code directly in Claude Code, Codex, or Antigravity.

---

## 🛠️ Usage & Commands

### 1. Global Installation & Pre-Flight Check
Strix is installed globally via `uv tool` or standalone binary. Never install per project:
```bash
# Pre-flight: Check global version
strix -v || uv tool run strix-agent -v

# If missing, install globally in one command:
uv tool install strix-agent  # or: curl -sSL https://strix.ai/install | bash
```

### 2. Running Security Scans
```bash
# Scan a local codebase / directory
strix --target .

# Scan a running local service (e.g. localhost:3000 or staging API)
strix --target http://localhost:3000

# Quick scan mode (faster turnaround for active development)
strix -m quick --target http://localhost:3000
```

### 3. Remediation Workflow
1. **Analyze Vulnerability Report**: Review the severity, endpoint, attack payload, and generated PoC.
2. **Check Root Cause**: Identify insecure parameter handling, missing middleware, or lack of authorization checks.
3. **Apply Fix**: Refactor the code adhering to secure defaults:
   - Use parameterized queries / ORM methods.
   - Enforce server-side session and role validation (do not trust client input).
   - Sanitize and encode user-supplied HTML/text.
   - Implement rate-limiting and CSRF tokens on state-changing endpoints.
4. **Re-test with Strix**: Re-run the specific exploit PoC to guarantee the patch works without breaking existing business logic.
