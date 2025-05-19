import { marked } from "marked";
import DOMPurify from "dompurify";

let socket = null;
let currentAssistantMsgEl = null;

export function initChat(options = {}) {
  let container = document.getElementById("akvo-rag");

  if (!container) {
    container = document.createElement("div");
    container.id = "akvo-rag";

    container.innerHTML = `
      <div id="akvo-rag-header">
        ${options.botName || "Chatbot"}
        <button id="akvo-rag-close-btn" class="akvo-rag-close-btn">
          <i class="fa fa-window-minimize" aria-hidden="true"></i>
        </button>
      </div>
      <div id="akvo-rag-body" class="akvo-rag-body">
        <p class="akvo-msg-system">Hello! How can I help you today?</p>
      </div>
      <div id="akvo-rag-input-container" class="akvo-rag-input-container">
        <input type="text" id="akvo-rag-input" placeholder="Type a message..." />
        <button id="akvo-rag-send-btn">Send</button>
      </div>
    `;

    const header = container.querySelector("#akvo-rag-header");
    const btn = container.querySelector("#akvo-rag-close-btn");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      container.classList.toggle("minimized");
    });

    header.addEventListener("click", () => {
      if (container.classList.contains("minimized")) {
        container.classList.remove("minimized");
      }
    });

    document.body.appendChild(container);

    connectWebSocket(options, (data) => {
      if (data.type === "info") {
        appendMessageToBody("system", data.message);
      } else if (data.type === "response_chunk") {
        updateStreamingAssistantMessage(data.content, data.citations);
      }
    });

    const input = container.querySelector("#akvo-rag-input");
    const sendBtn = container.querySelector("#akvo-rag-send-btn");

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendBtn.click();
    });

    sendBtn.addEventListener("click", () => {
      const text = input.value.trim();
      if (!text || socket?.readyState !== WebSocket.OPEN) return;

      socket.send(
        JSON.stringify({
          type: "chat",
          messages: [{ role: "user", content: text }],
        })
      );

      appendMessageToBody("user", text);
      input.value = "";
      currentAssistantMsgEl = null;
    });
  } else {
    container.classList.remove("minimized");
    const btn = container.querySelector("#akvo-rag-close-btn");
    btn.innerHTML = `<i class="fa fa-window-minimize" aria-hidden="true"></i>`;
  }
}

function connectWebSocket(options, onMessage) {
  socket = new WebSocket(options.wsURL);

  socket.onopen = () => {
    console.log("[WebSocket] Connected");
    socket.send(
      JSON.stringify({
        type: "auth",
        token: options.token,
        kb_id: options.kb_id,
      })
    );
  };

  socket.onmessage = (event) => {
    let data = null;
    try {
      data = JSON.parse(event.data);
    } catch {
      console.warn("[WebSocket] Received non-JSON data", event.data);
      return;
    }

    if (onMessage) {
      if (
        data.type === "response_chunk" &&
        data.content.includes("__LLM_RESPONSE__")
      ) {
        try {
          const [base64Part, responseText] =
            data.content.split("__LLM_RESPONSE__");

          const base64Clean = cleanBase64(base64Part);

          let contextData = null;
          if (base64Clean) {
            try {
              const decoded = atob(base64Clean);
              contextData = JSON.parse(decoded);
            } catch (e) {
              console.warn("Failed to decode or parse base64 contextData", e);
            }
          }

          const citations =
            contextData?.context?.map((citation, index) => ({
              id: index + 1,
              text: citation.page_content,
              metadata: citation.metadata,
            })) || [];

          onMessage({
            ...data,
            content: responseText.trim(),
            citations,
          });
        } catch (e) {
          console.error("Failed to parse __LLM_RESPONSE__", e);
          onMessage(data);
        }
      } else {
        onMessage(data);
      }
    }
  };

  socket.onclose = () => {
    console.log("[WebSocket] Connection closed");
  };

  socket.onerror = (error) => {
    console.error("[WebSocket] Error:", error);
  };
}

function cleanBase64(str) {
  if (!str) return "";
  const match = str.match(/[A-Za-z0-9+/=]+/);
  return match ? match[0] : "";
}

function appendMessageToBody(role, markdownText) {
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

function updateStreamingAssistantMessage(newChunk) {
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

  // Append new word to current raw text with a space
  if (!currentAssistantMsgEl.rawText) currentAssistantMsgEl.rawText = "";
  currentAssistantMsgEl.rawText +=
    (currentAssistantMsgEl.rawText ? " " : "") + word;

  // Clean the entire raw text before rendering
  const cleanedText = cleanStreamingText(currentAssistantMsgEl.rawText);

  // Render markdown from cleaned text
  const rawHTML = marked.parse(cleanedText);
  const safeHTML = DOMPurify.sanitize(rawHTML);
  currentAssistantMsgEl.innerHTML = safeHTML;

  // Auto scroll to bottom
  body.scrollTop = body.scrollHeight;
}

function cleanStreamingText(rawText) {
  let text = rawText;

  // 1. Join letters or numbers separated by spaces (e.g., "A G R A" -> "AGRA")
  text = text.replace(/\b(?:[A-Za-z0-9] ?){2,10}\b/g, (match) => {
    const noSpace = match.replace(/ /g, "");
    return noSpace.length <= 10 ? noSpace : match;
  });

  // 2. Remove spaces before punctuation marks like , . : ; !
  text = text.replace(/\s+([,.:;!?])/g, "$1");

  // 3. Fix markdown code blocks by removing spaces after ```
  text = text.replace(/``` *bash/g, "```bash");

  // 4. Merge lines that end with backslash \ with the next line (remove \ + newline)
  text = text.replace(/\\\n\s*/g, "");

  // 5. Replace 3 or more newlines with max 2 newlines
  text = text.replace(/\n{3,}/g, "\n\n");

  // 6. Replace multiple spaces or tabs with a single space
  text = text.replace(/[ \t]{2,}/g, " ");

  // 7. Trim spaces at the start and end of each line
  text = text
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  // 8. Join lines that are broken mid-sentence (if previous line doesn't end with punctuation)
  const paragraphs = [];
  let buffer = "";

  text.split("\n").forEach((line) => {
    if (line === "") {
      if (buffer) {
        paragraphs.push(buffer.trim());
        buffer = "";
      }
    } else {
      if (buffer) {
        if (!/[.!?]$/.test(buffer)) {
          buffer += " " + line;
        } else {
          paragraphs.push(buffer.trim());
          buffer = line;
        }
      } else {
        buffer = line;
      }
    }
  });

  if (buffer) paragraphs.push(buffer.trim());

  return paragraphs.join("\n\n");
}
