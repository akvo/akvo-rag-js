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

  // 1. Strip technical numerical prefixes like "0:", "1:", etc.
  word = word.replace(/^\d+:\s*/, "");

  // 2. Surgical parse: Find the content between the first and last double quotes
  const firstQuote = word.indexOf('"');
  const lastQuote = word.lastIndexOf('"');

  if (firstQuote !== -1) {
    if (lastQuote > firstQuote) {
      // It's a full or multi-line quoted string
      const interior = word.substring(firstQuote + 1, lastQuote);
      try {
        // Correctly decode JSON escapes
        word = JSON.parse('"' + interior + '"');
      } catch {
        word = interior;
      }
    } else {
      // Only one quote - likely a fragment boundary
      // If it's at the start, strip it
      if (firstQuote === 0) {
        word = word.substring(1);
      } else if (firstQuote === word.length - 1) {
        // If it's at the end, strip it
        word = word.substring(0, word.length - 1);
      }
    }
  }

  let combined = (currentText || "") + word;

  // 🛡️ Final Guard: Always clean leaks at the very beginning of the stream
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
