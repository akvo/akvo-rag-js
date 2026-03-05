# Research Findings: Issue #10 - Spacing Issues in Chat Widget

## Problem Analysis
The issue of odd spacing (e.g., "allev iation") in the chat widget stems from a combination of the streaming response handler and a sub-optimal text cleaning utility.

### Root Cause 1: Artificial Space Injection
In `src/utils/chat-renderer.js`, the `updateStreamingAssistantMessage` function appends a space between EVERY chunk received from the WebSocket:
```javascript
currentAssistantMsgEl.rawText += (currentAssistantMsgEl.rawText ? " " : "") + word;
```
Most LLM streaming APIs (including OpenAI-compatible ones) send chunks which already contain necessary whitespace. Manually injecting a space between chunks causes words to break if a chunk boundary falls inside a word (e.g., "alle" and "viation").

### Root Cause 2: Incomplete Text Cleaning
`src/utils/text-cleaner.js` attempts to "fix" these broken words using a regex:
```javascript
text = text.replace(
  /\b(?:[A-Za-z0-9](?: ?[A-Za-z0-9])){2,10}\b/g,
  (match) => { ... }
);
```
This regex is intended to join characters separated by spaces (e.g., "A G R A" -> "AGRA"). However:
1. It is limited to a certain length (effectively 10 repetitions of the group).
2. It might not handle single-space word breaks effectively if the resulting "word" is seen as multiple tokens by the regex word boundaries.
3. It has a hard-coded length check `noSpace.length <= 10` which prevents it from fixing longer words like "alleviation" (11 chars).

## Recommendations
1. **Primary Fix**: Modify `src/utils/chat-renderer.js` to concatenate chunks without adding a space.
2. **Refinement**: Update `src/utils/text-cleaner.js` to remove the aggressive word joining logic OR improve it to handle longer words and be less prone to false positives. Given the primary fix, the aggressive joining might no longer be necessary for standard RAG responses.

## Impact Assessment
- **UI/UX**: Clearer, more professional responses.
- **Performance**: Negligible impact on client-side rendering.
- **Risk**: Low, as long as we ensuring existing markdown formatting (which might use spaces) is preserved.
