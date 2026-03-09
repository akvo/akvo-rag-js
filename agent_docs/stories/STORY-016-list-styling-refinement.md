# STORY-016: UI Refinement - Markdown List Styling

**Role**: UI/UX Refinement
**Status**: Implemented
**Estimate**: 2 hours

## Description
As a user, I want markdown lists in AI responses to be clearly indented and legible, so that I can easily parse structured information without visual glitches or overlap.

## Acceptance Criteria (UAC)
- [x] Unordered lists (`ul`) use discs and have at least `1rem` left padding.
- [x] Ordered lists (`ol`) use decimal numbering and have at least `1rem` left padding.
- [x] Nested lists (up to 3 levels) have incremental indentation (approx. `1.25rem` per level).
- [x] List items (`li`) have consistent line height (`1.4`) and bottom margin (`6px`).
- [x] No markers (bullets/numbers) bleed outside the chat bubble or overlap with the bubble edge.

## Technical Notes (TAC)
- [x] Modify `src/scss/_markdown.scss` within the `.akvo-msg-assistant` scope.
- [x] Use `padding-left` instead of `margin-left` for the base `ul`/`ol` to ensure markers stay inside the layout flow.
- [x] Handle nested lists using SCSS nesting: `.akvo-msg-assistant ul li ul`.
- [x] Verify that global resets in `_chatbot.scss` don't break the list rendering.

## Actual Time
- **Research**: 0.5h
- **Implementation**: 0.75h
- **Verification**: 0.5h
