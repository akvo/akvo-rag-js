# Feature: 10 - Fix Spacing Issues

## Overview
The chat widget currently displays odd spacing in assistant responses, often breaking words (e.g., "allev iation" or "dign ified"). This occurs because the streaming logic appends spaces between chunks unconditionally, and the text cleaner has limits that prevent it from fixing all occurrences.

## User Stories Mapping
- [STORY-010]: As a user, I want to read clear and correctly formatted AI responses without mid-word spacing errors. (To be refined in Phase 5)

## Requirements
- **Functional**: Assistant messages MUST concatenate chunks directly without injecting extra spaces.
- **Functional**: The `text-cleaner.js` joining logic MUST accommodate words longer than 10 characters if retained.
- **Acceptance Criteria**:
    - "living income" should not display as "living inco me" or "livi ng income".
    - "alleviation" should display correctly even if split across chunks.
    - Markdown bold/italic/code remains functional.

## Constraints
- Must maintain compatibility with `marked` and `dompurify` as per project standards.
- Must respect the current CSS namespacing and widget isolation rules.
- Fix must be applied to `chat-renderer.js` and optionally `text-cleaner.js`.
