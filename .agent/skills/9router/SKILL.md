---
name: 9router
description: Connect and route AI agent requests through 9Router for token savings (RTK), automated fallback, and multi-provider load balancing.
---

# 9Router: AI Gateway, Token Saver & Multi-Provider Router ⚡

A complete guide for integrating coding agents (Antigravity, Claude Code, Codex, Cursor) with local 9Router, featuring **Dual Gemini Pro Multi-Account Load Balancing**.

---

## 🎯 Key Features & Benefits

1. **RTK Token Saver**: Losslessly compresses input context (`git diff`, `grep`, `ls`, file tree) by 20–40% before reaching the model.
2. **Dual-Account Gemini Pro Load Balancing**: Distribute high-velocity coding queries across multiple Gemini Pro API accounts to eliminate rate limits and bottlenecks.
3. **Smart 3-Tier Fallback**:
   - Tier 1: Primary Gemini Pro / Antigravity subscriptions.
   - Tier 2: Low-cost fast models (Gemini Flash, Groq).
   - Tier 3: Free emergency fallbacks.

---

## 🚀 Service Management

Control 9Router globally from any terminal using `9r` (or `./9router-service.sh`):
```bash
# Check status (including macOS LaunchAgent state)
9r status
# Or: ./9router-service.sh status

# Enable auto-start on macOS boot/login (LaunchAgent daemon)
9r enable-autostart

# Start service manually in background
9r start
# Or: ./9router-service.sh start

# Open Web Dashboard in browser
9r dashboard
# Or: ./9router-service.sh dashboard

# View live request logs
9r logs
# Or: ./9router-service.sh logs

# Stop service
9r stop
```

---

## 💎 Dual Gemini Pro Setup & Load Balancing

To maximize your 2 Gemini Pro subscriptions across your agent team:

### 1. Register Both Accounts in Dashboard
1. Open the 9Router dashboard: `http://127.0.0.1:20128/dashboard` (Default Password: `123456`).
2. Navigate to **Providers** ➔ **Google AI Studio / Gemini**.
3. Add **Account #1**:
   - Label: `Gemini-Pro-Primary`
   - API Key: `[Your First Gemini Key]`
   - Priority: `1`
4. Add **Account #2**:
   - Label: `Gemini-Pro-Secondary`
   - API Key: `[Your Second Gemini Key]`
   - Priority: `1` (Equal priority activates round-robin load balancing).

### 2. Strategy Routing & Automated Fallback
- **Load Balancing (Active-Active)**: Queries from parallel subagents (e.g., Frontend Dev and Backend Dev) automatically alternate between Key 1 and Key 2.
- **Failover (Active-Passive)**: If Account #1 hits rate limits (HTTP 429), 9Router transparently retries on Account #2 within 50ms with zero failed turns.
- **Automated Pro ➔ Flash Quota Fallback**:
  If **both** Gemini Pro subscriptions hit quota or rate limits during high-intensity parallel coding:
  - 9Router's Tier 2 Fallback automatically routes the pending request to **`gemini-2.0-flash`** (or `gemini-1.5-flash`).
  - Amelia (`bmad-dev`) and Council (`bmad-party`) continue coding seamlessly without throwing execution exceptions or halting the sprint.
  - As soon as the Pro rate limit window resets, 9Router automatically resumes routing queries back to Gemini Pro.

---

## 💻 Antigravity IDE Integration

To route coding assistant traffic through 9Router inside Antigravity IDE (with RTK token compression & auto-fallback):

1. Install an AI assistant extension (e.g. **Continue** or **Cline**) from the Extension marketplace (`Cmd+Shift+X`).
2. Configure the extension:
   - **Provider**: OpenAI Compatible
   - **Base URL**: `http://127.0.0.1:20128/v1`
   - **API Key**: `[from 9router dashboard]`
   - **Model**: `antigravity-stack` (or `ag/gemini-3.8-flash-high`)

Default URLs:
- **Dashboard**: `http://127.0.0.1:20128/dashboard`
- **Default Password**: `123456`
- **OpenAI-compatible Endpoint**: `http://127.0.0.1:20128/v1`

---

## 🔌 Connecting External Tools

### 1. Environment Variables (Terminal / Scripts)
```bash
export OPENAI_BASE_URL="http://127.0.0.1:20128/v1"
export OPENAI_API_KEY="[your-9router-api-key-from-dashboard]"
```

### 2. Claude Code (`~/.claude/config.json`)
```json
{
  "anthropic_api_base": "http://127.0.0.1:20128/v1",
  "anthropic_api_key": "your-9router-api-key"
}
```

### 3. Cursor IDE / Cline / RooCode
- **Provider**: OpenAI Compatible
- **Base URL**: `http://127.0.0.1:20128/v1`
- **API Key**: `[from 9router dashboard]`
