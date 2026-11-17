---
name: skill-development
description: Guidance for creating, structuring, and optimizing agent skills. Use when authoring new SKILL.md files, defining trigger conditions, progressive disclosure, or organizing reusable workflows.
---

# Skill Development Guide

A comprehensive architectural manual for creating, structuring, and optimizing modular AI agent skills with progressive disclosure, trigger tuning, and token efficiency.

---

## 📚 The Progressive Disclosure Model

```
┌────────────────────────────────────────────────────────────────────────┐
│ SYSTEM PROMPT INDEX (Always in Memory)                                 │
│ Only YAML frontmatter `name` + `description` (~30 tokens)              │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                        Task Matches Skill Trigger
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ ON-DEMAND FULL ACTIVATION (Loaded via `view_file`)                     │
│ Complete 2,000+ word deep manual with blueprints & checklists          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ✍️ Authoring Effective Frontmatter Triggers

The frontmatter description is the search index used by the AI router:

### ❌ Ineffective Description (Too Vague / Cluttered)
```yaml
---
name: database-tools
description: Handles database stuff and queries.
---
```

### ✅ High-Precision Description (Trigger-Dense & Explicit)
```yaml
---
name: database-tools
description: Query optimization, schema migrations, and index design for PostgreSQL/MySQL. Use when writing SQL queries, diagnosing slow queries, designing foreign keys, or running Alembic/Flyway migrations.
---
```

---

## 📁 Directory Architecture for Complex Skills

When a skill contains large reference tables, schemas, or automation scripts, split them cleanly:

```plaintext
my-specialized-skill/
├── SKILL.md                  # Main procedural playbook and checklists
├── scripts/
│   ├── validate_schema.py   # Executable verification scripts
│   └── seed_fixtures.sh
├── references/
│   ├── error_codes.md        # Extended lookup tables
│   └── api_contracts.json
└── examples/
    ├── basic_example.ts      # Minimal working sample
    └── advanced_example.ts   # Edge case handling sample
```

---

## 📋 Skill Quality Gate Checklist

- [ ] Directory name is kebab-case (`my-skill-name/`).
- [ ] Frontmatter description is under 40 words and contains distinct scenario keywords.
- [ ] Main `SKILL.md` contains actionable, sequential phases (Prerequisites → Procedure → Checklists).
- [ ] Code snippets use standardized project wrappers (`./dc.sh` or project CLI).
- [ ] No hardcoded secrets or broken relative links.
