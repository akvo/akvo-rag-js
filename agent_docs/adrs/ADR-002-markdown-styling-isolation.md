# ADR-002: Markdown Styling Isolation Strategy

- **Status**: Accepted
- **Context**:
  The Akvo RAG widget is embedded in various host sites which often have complex global CSS resets or frameworks like Tailwind/Bootstrap. These global styles can break the appearance of standard markdown elements (like list bullets disappearing or tables having no margins).

- **Decision**:
  We will implement a "Scoped Reset" strategy within the `.akvo-rag-body` container. Instead of relying on browser defaults or host styles, we will explicitly define all critical properties for markdown tags (`ul`, `ol`, `li`, `table`, `code`, etc.) using high-specificity selectors or the `.akvo-msg-assistant` parent class.

- **Alternatives Considered**:
  1. **Shadow DOM**: Provides perfect isolation but complicates bundle size and DOM traversal for existing logic (`marked`/`dompurify`).
  2. **Iframe**: Too heavy for a simple chat bubble and breaks the "integrated" feel.
  3. **Tailwind Typography (prose)**: Adds too much weight to the bundle and requires Tailwind setup.

- **Consequences**:
  - Consistent look across all websites.
  - Slightly larger CSS file due to explicit property definitions.
  - Requires manual maintenance of the CSS "reset" rule set.
