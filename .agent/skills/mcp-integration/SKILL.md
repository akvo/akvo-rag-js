---
name: mcp-integration
description: Comprehensive guide for connecting, configuring, debugging, and authoring Model Context Protocol (MCP) servers and tools. Use when integrating external APIs, Figma, GitHub, databases, or debugging MCP communication.
---

# Model Context Protocol (MCP) Integration Guide

A complete guide for integrating, configuring, debugging, and authoring Model Context Protocol (MCP) servers to extend AI agent capabilities with external tools, real-time databases, and cloud services.

---

## 🔌 Architecture & Transport Types

MCP connects AI client agents with servers via standardized JSON-RPC 2.0 messages over two primary transports:

### 1. Stdio Transport (Local Process Execution)
The AI agent spawns a child process and communicates via standard input / standard output (`stdin`/`stdout`):

```json
{
  "mcpServers": {
    "sqlite": {
      "command": "uvx",
      "args": ["mcp-server-sqlite", "--db-path", "./app.db"]
    },
    "git-tools": {
      "command": "node",
      "args": ["./scripts/mcp-git-server.js"],
      "env": {
        "GIT_DIR": "${WORKSPACE_ROOT}/.git"
      }
    }
  }
}
```

* **CRITICAL STDIO RULE**: The server process MUST write log or debug output exclusively to `stderr`. Any non-JSON-RPC text written to `stdout` corrupts the transport protocol.

---

### 2. SSE Transport (Server-Sent Events / Remote HTTP)
The agent connects to a long-running remote HTTP server endpoint:

```json
{
  "mcpServers": {
    "production-analytics": {
      "url": "https://mcp.internal.infra.io/sse",
      "headers": {
        "Authorization": "Bearer ${MCP_AUTH_TOKEN}"
      }
    }
  }
}
```

---

## 🛠️ Authoring a Custom MCP Tool (Node.js SDK)

```javascript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const server = new Server({
  name: "custom-db-mcp",
  version: "1.0.0"
}, {
  capabilities: { tools: {} }
});

// 1. Register Tool Definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "query_read_only",
        description: "Executes a safe read-only SQL query against the development database.",
        inputSchema: {
          type: "object",
          properties: {
            sql: { type: "string", description: "SELECT query to execute" }
          },
          required: ["sql"]
        }
      }
    ]
  };
});

// 2. Handle Tool Calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "query_read_only") {
    const { sql } = request.params.arguments;
    if (!sql.trim().toUpperCase().startsWith("SELECT")) {
      throw new Error("Only SELECT queries are permitted.");
    }
    const results = await executeQuery(sql);
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
    };
  }
  throw new Error(`Tool not found: ${request.params.name}`);
});

// 3. Connect Transport
const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## 🔍 Debugging & Troubleshooting MCP

| Common Symptom | Root Cause | Solution |
|---|---|---|
| **Server fails to start / Hangs on connect** | Stdio output pollution (logging to `stdout`). | Change all server logs from `console.log()` to `console.error()`. |
| **Tool arguments rejected** | Schema mismatch or missing `required` properties. | Validate argument types against `inputSchema` using Zod. |
| **Authentication 401/403** | Missing environment variable in config. | Verify `${ENV_VAR}` expansion and tokens in `.env` / environment. |
