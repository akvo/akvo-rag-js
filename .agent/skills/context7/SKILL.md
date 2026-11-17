---
name: context7
description: Real-time, version-specific documentation retrieval and code example lookups via Context7 MCP and CLI to prevent outdated APIs and hallucinations.
---

# Context7: Up-to-Date Documentation & Code Context

Guide for fetching fresh, official, and version-accurate documentation using Context7 to guarantee zero hallucinated APIs and outdated syntax.

---

## 🔍 Why Context7?

LLMs have knowledge cutoffs and frequently invent or confuse APIs across major library versions (e.g., Next.js App Router vs Pages Router, Tailwind v3 vs v4, Drizzle ORM, Zod, TanStack Query v5). Context7 resolves this by injecting live, canonical documentation into the agent's context.

---

## 🛠️ Modes of Operation

### 1. Model Context Protocol (MCP) Mode
When Context7 MCP is configured:
* **`resolve-library-id`**:
  Converts generic package names (e.g. `nextjs`, `tailwind`, `zod`, `playwright`) into exact Context7 library identifiers (e.g. `/vercel/next.js`, `/tailwindlabs/tailwindcss`).
* **`query-docs`**:
  Fetches targeted documentation chunks, setup guides, and accurate code examples for the requested library and version.

**Agent Execution Pattern**:
1. When asked to implement or update code using a third-party framework or package, first resolve the library ID via `resolve-library-id`.
2. Query specific endpoints/methods via `query-docs`.
3. Generate code using the retrieved official examples rather than training data assumptions.

### 2. Context7 CLI Mode (`ctx7`)
Context7 CLI is installed globally. The agent does not need to install it in target projects:
```bash
# Pre-flight: Check global version
ctx7 --version || npx -y ctx7 --version

# Query official docs and code examples
ctx7 query "how to use server actions in next.js"

# Setup Context7 configuration if needed
ctx7 setup --claude
```
