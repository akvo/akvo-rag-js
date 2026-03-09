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

  // 2. Remove surrounding technical quotes if they exist at the boundaries
  //    Matches: "content", "content, content"
  //    We use a simple approach: if it starts with a quote, strip it. If it ends with a quote, strip it.
  if (word.startsWith('"')) word = word.substring(1);
  if (word.endsWith('"')) word = word.substring(0, word.length - 1);
  // Important: Also handle chunks that might have trailing spaces AFTER the quote
  else if (word.trimEnd().endsWith('"')) {
    word = word.trimEnd();
    word = word.substring(0, word.length - 1);
  }

  // 3. Decode JSON escapes (like \n, \", etc.)
  try {
    // We wrap it in quotes and parse it to let the engine handle escapes
    // If there ARE quotes inside the content, we must escape them for JSON.parse
    const escaped = word.replace(/\\"/g, '"').replace(/"/g, '\\"');
    word = JSON.parse('"' + escaped + '"');
  } catch {
    // Fallback to raw word if parse fails
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
