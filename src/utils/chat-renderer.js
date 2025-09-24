import { marked } from "marked";
import DOMPurify from "dompurify";
import { cleanStreamingText } from "./text-cleaner.js";

export function appendMessageToBody(
  role,
  markdownText,
  isTyping = false,
  messageCounter
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

export function updateStreamingAssistantMessage(
  newChunk,
  currentAssistantMsgEl
) {
  const body = document.querySelector("#akvo-rag-body");
  if (!body || !newChunk || !currentAssistantMsgEl) return;

  // 🚫 Ignore non-message chunks (metadata like finishReason, usage, etc.)
  if (/^\s*d:\{/.test(newChunk)) {
    return;
  }

  // Reset typing animation
  currentAssistantMsgEl.innerHTML = "";

  if (!currentAssistantMsgEl.rawText) currentAssistantMsgEl.rawText = "";

  // Parsing and decode chunk
  const match = newChunk.match(/:\s*"(.*)"/);
  let word = match ? match[1] : newChunk;

  try {
    word = JSON.parse('"' + word.replace(/"/g, '\\"') + '"');
  } catch {}

  currentAssistantMsgEl.rawText +=
    (currentAssistantMsgEl.rawText ? " " : "") + word;

  // Remove extra quote mark
  currentAssistantMsgEl.rawText = currentAssistantMsgEl.rawText.replace(
    /^"\s*/,
    ""
  );

  const cleanedText = cleanStreamingText(currentAssistantMsgEl.rawText);
  const rawHTML = marked.parse(cleanedText);
  const safeHTML = DOMPurify.sanitize(rawHTML);
  currentAssistantMsgEl.innerHTML = safeHTML;

  body.scrollTop = body.scrollHeight;
}
