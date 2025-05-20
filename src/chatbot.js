import { connectWebSocket } from "./lib/websocket.js";
import {
  appendMessageToBody,
  updateStreamingAssistantMessage,
} from "./utils/chat-renderer.js";

let socket = null;
let currentAssistantMsgEl = null;
let isLoading = false;
let citations = [];
let messageCounter = 0;

export function initChat(options = {}) {
  let container = document.getElementById("akvo-rag");

  if (!container) {
    container = document.createElement("div");
    container.id = "akvo-rag";

    container.innerHTML = `
      <div id="akvo-rag-header">
        ${options.title || "Chatbot"}
        <button id="akvo-rag-close-btn" class="akvo-rag-close-btn">
          <i class="fa fa-window-minimize" aria-hidden="true"></i>
        </button>
      </div>
      <div id="akvo-rag-body" class="akvo-rag-body">
        <p class="akvo-msg-system">Hello! How can I help you today?</p>
      </div>
      <div id="akvo-rag-input-container" class="akvo-rag-input-container">
        <input
          type="text"
          id="akvo-rag-input"
          placeholder="Type a message..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        />
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

    socket = connectWebSocket(options, (data) => {
      if (data.type === "info") {
        appendMessageToBody("system", data.message);
      } else if (data.type === "start") {
        citations = [];
        messageCounter++;
        currentAssistantMsgEl = appendMessageToBody(
          "assistant",
          "",
          true,
          messageCounter
        );
      } else if (data.type === "response_chunk") {
        if (data?.citations?.length) {
          citations = [...citations, ...data.citations];
        }
        updateStreamingAssistantMessage(data.content, currentAssistantMsgEl);
      } else if (data.type === "end") {
        const el = document.querySelector(
          `#akvo-msg-assistant-${messageCounter}`
        );
        if (el) {
          replaceCitations(el, citations);
        }
        isLoading = false;
        sendBtn.disabled = false;
        sendBtn.innerHTML = "Send";
      }
    });

    const input = container.querySelector("#akvo-rag-input");
    const sendBtn = container.querySelector("#akvo-rag-send-btn");

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendBtn.click();
    });

    sendBtn.addEventListener("click", () => {
      if (isLoading) return;

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
      sendBtn.disabled = true;
      sendBtn.innerHTML = `<span class="akvo-send-spinner"></span>`;
      isLoading = true;
    });
  } else {
    container.classList.remove("minimized");
    const btn = container.querySelector("#akvo-rag-close-btn");
    btn.innerHTML = `<i class="fa fa-window-minimize" aria-hidden="true"></i>`;
  }
}

function replaceCitations(el, citations) {
  // TODO :: provide correct popover to show the citation docs
  if (!el) return;

  let html = el.innerHTML;

  citations.forEach((c) => {
    const regex = new RegExp(`\\[ citation: ${c.id} \\]`, "g");
    const linkHTML = `<sup class="citation" data-title="${c.title}" data-url="${
      c?.url || "#"
    }">[${c.id}]</sup>`;
    html = html.replace(regex, linkHTML);
  });

  el.innerHTML = html;

  // Optional: attach hover popover
  const citationLinks = el.querySelectorAll(".citation");
  citationLinks.forEach((node) => {
    node.style.cursor = "pointer";
    node.title = node.dataset.title;
    node.addEventListener("click", () => {
      window.open(node.dataset.url, "_blank");
    });
  });
}
