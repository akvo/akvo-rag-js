import { marked } from "marked";
import DOMPurify from "dompurify";
import { cleanStreamingText } from "./text-cleaner.js";

let currentAssistantMsgEl = null;

export function appendMessageToBody(role, markdownText) {
  const body = document.querySelector("#akvo-rag-body");
  if (!body || !markdownText) return;

  const msg = document.createElement("div");
  msg.className = `akvo-msg-${role}`;

  const rawHTML = marked.parse(markdownText);
  const safeHTML = DOMPurify.sanitize(rawHTML);

  msg.innerHTML = safeHTML;
  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
}

export function updateStreamingAssistantMessage(newChunk) {
  const body = document.querySelector("#akvo-rag-body");
  if (!body || !newChunk) return;

  if (!currentAssistantMsgEl) {
    currentAssistantMsgEl = document.createElement("div");
    currentAssistantMsgEl.className = "akvo-msg-assistant";
    currentAssistantMsgEl.id = "streaming-msg";
    body.appendChild(currentAssistantMsgEl);
  }

  // Extract the string after ":" in format like '0:"..."' with quotes
  const match = newChunk.match(/:\s*"(.*)"/);
  let word = match ? match[1] : newChunk;

  try {
    // Decode escape characters from word string with JSON.parse
    word = JSON.parse('"' + word.replace(/"/g, '\\"') + '"');
  } catch {
    // If decoding fails, use raw text
  }

  if (!currentAssistantMsgEl.rawText) currentAssistantMsgEl.rawText = "";
  currentAssistantMsgEl.rawText +=
    (currentAssistantMsgEl.rawText ? " " : "") + word;

  const cleanedText = cleanStreamingText(currentAssistantMsgEl.rawText);

  const rawHTML = marked.parse(cleanedText);
  const safeHTML = DOMPurify.sanitize(rawHTML);
  currentAssistantMsgEl.innerHTML = safeHTML;

  body.scrollTop = body.scrollHeight;
}
