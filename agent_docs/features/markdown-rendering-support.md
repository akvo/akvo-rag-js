# Feature: Enhanced Markdown Support

## Overview
The chat widget currently supports basic markdown parsing via `marked`. However, the styling of complex markdown elements (lists, tables, code blocks, etc.) is missing or incomplete, leading to unstyled or poorly formatted output. This feature aims to provide a premium, fully-styled markdown experience that is secure and isolated from the host site.

## User Stories Mapping
- [STORY-MD-01]: As a user, I want to see clearly formatted lists, tables, and code blocks in AI responses.
- [STORY-MD-02]: As a developer, I want markdown rendering to be secure and not leak styles to/from the host site.

## Requirements
- **Functional**: Assistant messages MUST support GFM (GitHub Flavored Markdown).
- **Functional**: The parser MUST be configured to handle line breaks (`breaks: true`).
- **Functional**: All markdown elements MUST have defined styles within the `.akvo-rag` namespace.
- **Acceptance Criteria**:
    - **Lists**: Correct bullets and indentation, even on sites with CSS resets.
    - **Tables**: Styled with borders, padding, and zebra striping.
    - **Code Blocks**: Distinct background, monospace font, and horizontal scroll on overflow.
    - **Blockquotes**: Left-border accent and italicized/muted text.
    - **Security**: 100% of HTML output passes through `dompurify`.

