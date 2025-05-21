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
  if (!el) return;

  let html = el.innerHTML;

  citations.forEach((c) => {
    const citationId = c.id;
    const escapedRegex = new RegExp(`\\[ citation: ${citationId} \\]`, "g");

    // Slice text to max 200 chars
    const shortText = c.text.replace(/\s+/g, " ").trim().slice(0, 200) + "...";

    // Metadata info
    const source = c.metadata.source || "Unknown Source";
    const page = c.metadata.page_label || c.metadata.page || "n/a";
    const title = c.metadata.title || "Untitled Document";

    const popoverHTML = `
      <sup
        class="citation"
        data-id="${citationId}"
        data-text="${shortText.replace(/"/g, "&quot;")}"
        data-source="${source}"
        data-page="${page}"
        data-title="${title}"
      >[${citationId}]</sup>`;

    html = html.replace(escapedRegex, popoverHTML);
  });

  el.innerHTML = html;

  const citationNodes = el.querySelectorAll(".citation");
  citationNodes.forEach((node) => {
    node.style.cursor = "pointer";
    node.addEventListener("mouseenter", showPopover);
    node.addEventListener("mouseleave", hidePopover);
  });
}

function showPopover(event) {
  const node = event.target;

  hidePopover(event);

  // Popover element
  const popover = document.createElement("div");
  popover.className = "citation-popover";
  popover.innerHTML = `
    <div class="arrow"></div>
    <strong>${node.dataset.title}</strong><br>
    <small>Source: ${node.dataset.source}, Page: ${node.dataset.page}</small><br>
    <p>${node.dataset.text}</p>
  `;
  document.body.appendChild(popover);

  const rect = node.getBoundingClientRect();
  const popoverWidth = 300;
  const popoverHeight = popover.offsetHeight || 100;
  const arrowSize = 8;
  const margin = 10;

  // horizontal
  let left = rect.left + window.scrollX - popoverWidth / 2 + rect.width / 2;
  if (left + popoverWidth > window.innerWidth - margin) {
    left = window.innerWidth - popoverWidth - margin;
  }
  if (left < margin) {
    left = margin;
  }

  // vertical
  const spaceAbove = rect.top;
  const spaceBelow = window.innerHeight - rect.bottom;
  const showAbove = spaceBelow < popoverHeight + arrowSize + margin;

  const top = showAbove
    ? rect.top + window.scrollY - popover.offsetHeight - arrowSize - 2
    : rect.bottom + window.scrollY + arrowSize + 2;

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
  popover.dataset.target = node.dataset.id;

  // Add class based on direction
  popover.classList.toggle("above", showAbove);
  popover.classList.toggle("below", !showAbove);

  // Arrow position
  const arrow = popover.querySelector(".arrow");
  const citationCenterX = rect.left + rect.width / 2 + window.scrollX;
  const arrowLeft = citationCenterX - left - arrowSize;
  arrow.style.left = `${arrowLeft}px`;
}

function hidePopover(event) {
  const node = event.target;
  const popovers = document.querySelectorAll(`.citation-popover`);
  popovers.forEach((el) => {
    if (el.dataset.target === node.dataset.id) {
      el.remove();
    }
  });
}
