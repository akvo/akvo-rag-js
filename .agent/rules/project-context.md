---
trigger: always_on
---

## Project Context

This project was developed by the Akvo Team as an embeddable client-side chatbot widget.
<!-- last-aligned: 2026-11-17 -->

### Tech Stack
- **Project Name**: `akvo-rag-js` (v1.2.3)
- **Language**: JavaScript (ESM / Native ES Modules, Node.js v18+)
- **Bundler & Tooling**: Webpack 5 (`webpack.config.cjs`), Babel (`@babel/core`, `@babel/preset-env`)
- **Styling**: Scoped SCSS (`sass`), nested under `#akvo-rag` namespace
- **Core Dependencies**: `dompurify` (HTML sanitization), `marked` (GFM markdown parser), `font-awesome`
- **Package Manager**: `npm`
- **Test Runner**: Native Node.js Test Runner (`node --test tests/**/*.test.mjs`)

### Execution Commands
- **Dev server**: `npm run dev`
- **Run tests**: `npm test`
- **Build production**: `npm run build`
- **Release**: `./release.sh`

### Documentation Standards & Paths
- **Documentation Root**: `agent_docs/` (Native project documentation location)
- **Architecture**: `agent_docs/architecture.md`
- **ADRs**: `agent_docs/adrs/`
- **Features / Implementation Plans**: `agent_docs/features/{feature_name}.md`
- **User Stories**: `agent_docs/stories/{story_name}.md`
- **Sprint Plan**: `agent_docs/sprint-plan.md`
- **Plan Spec Template**: `.agent/templates/FEATURE_SPEC.md`

### Project Conventions (External Standards — Authoritative)
- **Akvo Developer Guidelines**:
  - Minimum **80% test coverage gate** on domain logic.
  - Branch naming: `feature/<issue_number>-<issue_description>`.
  - Commit message standard: `[#issue_number] <type>(<scope>): <description>`.
  - Rebase mandate: `git pull --rebase` (never `git merge` or merge commits).
  - Explicit staging only (`git add <file1> <file2>`); never blanket `git add .` or `git add -A`.
- **Widget Isolation & Security Mandates**:
  - Root scope: all CSS strictly scoped under `#akvo-rag` with `akvo-` class prefix.
  - 100% of rendered HTML output passes through `dompurify` before insertion into DOM.
  - Clean component lifecycle: `AkvoRagChatbox` supports multiple instances and `destroy()`.
  - Zero unhandled secrets or sensitive tokens in client bundles.

### Architecture Notes
- Source files reside in `/src` (e.g. `src/chatbot.js`, `src/chat-renderer.js`, `src/text-cleaner.js`, `src/lib/websocket.js`).
- Internal imports in `/src` must include explicit `.js` extensions.
- Tests reside in `/tests` using native Node test runner (`tests/unit/`, `tests/features/`).

### External Convention Files Found
- `agent_docs/GEMINI.md` ✅ — Project memory and BMAD methodology history.
- `AGENTS.md` ✅ — Multi-agent system guidelines.
- `CLAUDE.md` ✅ — Claude Code engineering protocol.
