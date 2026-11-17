---
name: plugin-structure
description: Standards for organizing plugins, skills, subagents, and tools. Use when structuring new plugin bundles, configuring manifests, or setting up modular agent extensions.
---

# Plugin & Agent Package Architecture

A standardized guide for architecting, packaging, and distributing modular agent plugins containing slash commands, autonomous subagents, skills, and lifecycle hooks.

---

## 📁 Standard Plugin Directory Hierarchy

```plaintext
my-developer-plugin/
├── .claude-plugin/           # Plugin metadata & discovery manifest
│   └── plugin.json
├── commands/                 # Slash commands (Markdown prompts with YAML frontmatter)
│   ├── build-feature.md
│   └── run-audit.md
├── agents/                   # Subagent persona definitions
│   ├── reviewer.md
│   └── architect.md
├── skills/                   # Modular skills (subdirectories with SKILL.md)
│   ├── db-optimization/
│   │   ├── SKILL.md
│   │   └── references/
│   └── api-design/
│       └── SKILL.md
├── hooks/                    # Event-driven automation hooks
│   └── hooks.json
└── README.md                 # Plugin documentation and installation guide
```

---

## ⚙️ Manifest Schema (`plugin.json`)

```json
{
  "$schema": "https://json.schemastore.org/claude-plugin.json",
  "name": "bmad-core-toolkit",
  "version": "1.2.0",
  "description": "Essential agile development personas, skills, and quality gates for AI coding assistants.",
  "author": {
    "name": "BMAD Team",
    "url": "https://github.com/wayangalihpratama/my-antigravity-pilot"
  },
  "keywords": ["bmad", "agile", "tdd", "ux", "review", "security"],
  "license": "MIT"
}
```

---

## 🚀 Portability & Distribution Best Practices

- **Self-Contained Paths**: Use relative paths (`./`) or dynamic root expansions (`${PLUGIN_ROOT}`) so plugins function regardless of installation directory.
- **Dependency Isolation**: If a skill or hook requires Python or Node utilities, bundle lightweight scripts within the plugin rather than assuming global host installations.
