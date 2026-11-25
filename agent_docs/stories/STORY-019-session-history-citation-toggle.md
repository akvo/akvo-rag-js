# STORY-019: Cross-Page Chat History Persistence & Citation Display Toggle

- **Epic**: [CHAT-003] akvo-rag-js Package Enhancement: Session History Persistence & Citation Toggle
- **Feature Spec**: `agent_docs/features/20-session-history-and-citation-toggle.md`
- **GitHub Issue**: [#20](https://github.com/akvo/akvo-rag-js/issues/20)
- **Status**: Ready for Implementation

---

## Story Statement
As a user browsing an SPA or multi-page portal with an integrated Akvo RAG chatbot,  
I want my conversation history to remain visible when I navigate across different routes or pages within my browser session, while ensuring that my dialogue is private to my user account and never shared with other users,  
And as an application developer, I want configuration options to turn history persistence on or off (`persistHistory: boolean`) and toggle citation popovers on or off (`showCitations: boolean`),  
So that users never lose their conversation context while browsing, user privacy is safeguarded in multi-user environments, and hosts have full presentation control.

---

## Acceptance Criteria
1. **Parameterized Chat History Persistence (On / Off)**:
   - When `options.persistHistory: true` (default `true`), user queries and assistant responses are automatically serialized to storage.
   - When `options.persistHistory: false`, dialogue is strictly ephemeral in memory; zero reads or writes to storage.
   - Storage backend defaults to `sessionStorage`, configurable via `options.historyStorageType: "session" | "local"`.
   - Maximum messages retained is capped at `options.maxHistoryMessages` (default `20`) using a FIFO sliding window.
2. **Strict Multi-User Isolation**:
   - Accepts `options.userId: string` (optional, for authenticated users). If omitted, falls back to `options.visitorId` / `this.visitorId`.
   - Keys are composite: `${options.historyStorageKey}_${userScope}_${options.kb_id || "default"}` (default storage key `"akvo_rag_history"`).
   - Switching `userId` (e.g. User A to User B) completely isolates conversations: User B never sees User A's history.
3. **Conversation Rehydration on Mount**:
   - On widget `init()`, if stored dialogue exists for the active user and KB, it is parsed and rendered into `#akvo-rag-body`.
   - Rehydrated messages are strictly sanitized using `DOMPurify.sanitize(marked.parse(text))` to prevent XSS.
   - The message container automatically scrolls to the most recent turn.
4. **Public History Management APIs**:
   - `chatbox.clearHistory()`: Removes stored history from Web Storage for the current user/KB and clears `this.chatHistory`.
   - `chatbox.getHistory()`: Returns a deep copy of current conversation messages.
5. **Citation Display Toggle (`showCitations: boolean`)**:
   - When `options.showCitations: false`, all `[citation:X]` tags are stripped from assistant responses before DOM injection.
   - No `<sup>` elements, popover triggers, or broken brackets appear in the rendered message.
   - When `options.showCitations: true` (default `true`), standard citation badges and hover popovers are rendered normally.
6. **Quality & Test Gates**:
   - Unit tests cover on/off toggling, multi-user isolation, storage writing, reading, corruption handling, quota errors, rehydration DOM structure, and citation regex stripping.
   - `npm test` passes 100% with $\ge 80\%$ line and branch coverage.
