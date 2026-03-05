# Story: STORY-MD-02 - Isolated Markdown Styling
**Status: Implemented**


**As a** user
**I want** to see clearly formatted lists, tables, and code blocks
**So that** I can easily digest the information provided by the AI.

### Timeline & Effort
- **Estimated Time**: 6h
- **Actual Time**: 4h (Assistant Aided)

- **Effort Points**: 5

### Acceptance Criteria
#### User Acceptance Criteria (UAC)
- [x] Lists have visible bullets/numbers and proper indentation.
- [x] Tables are clearly visible with borders and zebra striping.
- [x] Code blocks have a distinct background color and monospace font.
- [x] Styles are consistent across different host websites.


#### Technical Acceptance Criteria (TAC)
- [x] Create `_markdown.scss` with scoped resets for all MD elements.
- [x] Use `.akvo-msg-assistant` as the scoping class.
- [x] Ensure all styles use `akvo-` variables for consistency.
- [x] Handle horizontal overflow for tables and code blocks.


### Definition of Done
- [x] `_markdown.scss` created and imported.
- [x] Visual verification on a site with standard CSS resets.
- [x] No regressions in existing message bubbble styles.

