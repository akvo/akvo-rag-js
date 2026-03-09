# STORY-014: Leading Quote Bug Fix

## Description
As a user, I want AI responses to start cleanly without any technical artifacts like a leading double-quote (`"`).

## Acceptance Criteria
- [x] Responses starting with `0:"` or `0: "` are correctly parsed.
- [x] Extra leading `"` from JSON segments is removed.
- [x] Escaped quotes within the message are preserved and rendered correctly.
- [x] Unit tests verify multiple edge cases for chunk parsing.

## Technical Notes
Refactored `chat-renderer.js` to extract `accumulateAssistantText` for testability and hardened the regex to handle technical prefixes and optional whitespace.

## Status
- **Status**: COMPLETED
- **Actual Time**: 2.5h
- **Release**: 1.2.3
