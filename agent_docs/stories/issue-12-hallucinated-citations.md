# Story #12: Prevent Hallucinated Citations from Rendering

## Metadata
- **Epic**: Chat UI Refinements
- **Type**: Bug Fix
- **Status**: Done
- **Estimated Effort**: 1
- **Actual Time**: ~30m

## Description
As an end-user, I should not see hallucinated citation markers like `[citation:0]` in the chat interface when the LLM generates a citation that does not correspond to an actual document in the retrieved context.

Currently, valid citations are correctly transformed into interactive superscript bubbles. However, if a citation ID is entirely missing from the metadata array, the regex replacement fails to match, leaving the raw text visible to the user.

## User Acceptance Criteria (UAC)
- [x] Any `[citation:X]` text where X is a number NOT present in the backend's citation array is completely removed from the rendered chat bubble.
- [x] Valid citations (those present in the array) continue to render correctly as interactive popover bubbles.

## Technical Acceptance Criteria (TAC)
- [x] Add a regex replacement in `src/utils/citations-popover.js` (after the `citations.forEach` loop) to strip out unmatched `[citation:X]` tags globally.
- [x] Add a unit test in `tests/unit/citations.test.mjs` verifying that hallucinated citations are scrubbed from the final HTML.
- [x] The regex must account for HTML-escaped characters (e.g., brackets that were sanitized by `dompurify` elsewhere, though this logic happens post-sanitization usually).

## Technical Notes
- We are using the `bmad-fastpath` workflow for this fix.
- The regex must be robust enough to handle potential trailing spaces inside the citation tag.
