# Story: STORY-MD-01 - GFM Parsing Configuration
**Status: Implemented**


**As a** system
**I want** the markdown parser to be configured for GitHub Flavored Markdown and line breaks
**So that** AI responses are parsed accurately and respect the intended text structure.

### Timeline & Effort
- **Estimated Time**: 2h
- **Actual Time**: 0.5h (Assistant Aided)

- **Effort Points**: 1

### Acceptance Criteria
#### User Acceptance Criteria (UAC)
- [x] Assistant responses correctly parse `\n` as line breaks.
- [x] Tables are identified as table structures, not plain text.
- [x] Code blocks are identified as code tags.


#### Technical Acceptance Criteria (TAC)
- [x] Configure `marked` with `breaks: true` and `gfm: true`.
- [x] Ensure `dompurify` allows standard table tags (`table`, `thead`, `tbody`, `tr`, `th`, `td`).


### Definition of Done
- [x] Parsing logic updated in `chat-renderer.js`.
- [x] Manual verification with a GFM test string.
