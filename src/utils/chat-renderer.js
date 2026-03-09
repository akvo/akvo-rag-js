import { marked } from "marked";
import DOMPurify from "dompurify";
import { cleanStreamingText } from "./text-cleaner.js";

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function appendMessageToBody(
  role,
  markdownText,
  isTyping = false,
  messageCounter,
) {
  const body = document.querySelector("#akvo-rag-body");
  if (!body) return;

  const msg = document.createElement("div");
  const msgId = `akvo-msg-${role}-${messageCounter}`;
  msg.id = msgId;
  msg.className = `akvo-msg-${role}`;

  if (isTyping) {
    msg.innerHTML = `
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    `;
  } else {
    const rawHTML = marked.parse(markdownText || "");
    const safeHTML = DOMPurify.sanitize(rawHTML);
    msg.innerHTML = safeHTML;
  }

  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;

  return msg;
}

export function accumulateAssistantText(newChunk, currentText = "") {
  // 🚫 Ignore technical metadata
  if (/^\s*d:\{/.test(newChunk)) return currentText;

  let word = newChunk;

  // 1. Strip technical prefixes like "0:", "1:", etc. and optional space
  word = word.replace(/^\d+:\s*/, "");

  // 2. Extract content between quotes if present
  const match =
    word.match(/^"(.*)"$/) || // Full quoted string
    word.match(/^"(.*)$/) || // Starting quote
    word.match(/(.*)"$/); // Ending quote

  if (match) {
    word = match[1];
    // 3. Decode common escapes if it's a raw string part from a JSON field
    try {
      word = JSON.parse('"' + word + '"');
    } catch {
      // Fallback if the above fails due to complex escaping
      try {
        word = JSON.parse('"' + word.replace(/"/g, '\\"') + '"');
      } catch {}
    }
  }

  let combined = (currentText || "") + word;

  // 🛡️ Final Guard: Always ensure no technical quotes leak at the very beginning
  return combined.replace(/^"\s*/, "");
}

export function updateStreamingAssistantMessage(
  newChunk,
  currentAssistantMsgEl,
) {
  const body = document.querySelector("#akvo-rag-body");
  if (!body || !newChunk || !currentAssistantMsgEl) return;

  if (!currentAssistantMsgEl.rawText) currentAssistantMsgEl.rawText = "";

  const newText = accumulateAssistantText(
    newChunk,
    currentAssistantMsgEl.rawText,
  );

  currentAssistantMsgEl.rawText = newText;

  const cleanedText = cleanStreamingText(currentAssistantMsgEl.rawText);

  // 🚀 Optimization: Only re-render if the cleaned text actually changed
  if (currentAssistantMsgEl.lastRenderedText === cleanedText) {
    return;
  }

  const rawHTML = marked.parse(cleanedText);
  const safeHTML = DOMPurify.sanitize(rawHTML);

  // 🚀 Optimization: Use DOM updates only when content changes
  currentAssistantMsgEl.innerHTML = safeHTML;
  currentAssistantMsgEl.lastRenderedText = cleanedText;

  body.scrollTop = body.scrollHeight;
}
