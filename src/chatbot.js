import { connectWebSocket } from "./lib/websocket.js";
import {
  appendMessageToBody,
  updateStreamingAssistantMessage,
} from "./utils/chat-renderer.js";
import { replaceCitations } from "./utils/citations-popover.js";
import { getOrCreateVisitorId } from "./utils/uuid.js";

let wsConnection = null;
let currentAssistantMsgEl = null;
let isLoading = false;
let citations = [];
let messageCounter = 0;
let chatHistory = [];

const CHAT_HISTORY_SLICE = -10;
const DEFAULT_WELCOME_MESSAGE = "Hello! How can I help you today?";

/**
 * Initializes the chat widget with the provided options.
 *
 * @param {Object} options - Configuration options for initializing the chat widget.
 * @param {string} options.title - The title displayed in the chat window.
 * @param {number|null} options.kb_id - The ID of the knowledge base to use (optional).
 * @param {string} options.wsURL - The WebSocket URL to connect for chat communication.
 * @param {Array<{ kb_id: number, label: string }>} [options.kb_options] - List of KBs for user selection (optional).
 */
export function initChat(options = {}) {
  let container = document.getElementById("akvo-rag");
  const visitorId = getOrCreateVisitorId();

  if (!container) {
    // Create the container for the chat widget if it doesn't exist
    container = document.createElement("div");
    container.id = "akvo-rag";

    // Inner HTML includes header, body, and conditional input container
    container.innerHTML = `
      <div id="akvo-rag-header">
        ${options.title || "Chatbot"}
        <button id="akvo-rag-close-btn" class="akvo-rag-close-btn">
          <i class="fa fa-window-minimize" aria-hidden="true"></i>
        </button>
      </div>
      <div id="akvo-rag-body" class="akvo-rag-body">
        ${
          // If no kb_id is provided, show KB selection options
          !options.kb_id && options.kb_options?.length
            ? `
              <div id="akvo-kb-options" class="akvo-kb-options">
                <p>Please select a knowledge base to continue:</p>
                ${options.kb_options
                  .map(
                    (kb) => `
                    <div class="kb-option">
                      <input type="radio" id="kb-${kb.kb_id}" name="akvo-kb" value="${kb.kb_id}">
                      <label for="kb-${kb.kb_id}">${kb.label}</label>
                    </div>
                  `
                  )
                  .join("")}
                <div class="akvo-kb-options-hint">
                  After selecting, click "Start Chat" to begin.
                </div>
              </div>
            `
            : `<p class="akvo-msg-system">${DEFAULT_WELCOME_MESSAGE}</p>`
        }
      </div>
      <div id="akvo-rag-input-container" class="akvo-rag-input-container">
        ${
          // If no kb_id, show "Start Chat" button; else show input and send button
          !options.kb_id
            ? `
              <button id="akvo-start-chat-btn" class="akvo-start-chat-btn" style="flex: 1;" disabled>
                Start Chat
              </button>
            `
            : `
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
            `
        }
      </div>
    `;

    // Handle minimize/expand of chat widget
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

    // Append container to document body
    document.body.appendChild(container);

    /**
     * WebSocket message handler: processes different types of messages.
     */
    const onMessage = (data) => {
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
          if (el?.rawText) {
            chatHistory.push({
              role: "assistant",
              content: el.rawText,
            });
          }
        }
        isLoading = false;
        const sendBtn = container.querySelector("#akvo-rag-send-btn");
        if (sendBtn) {
          sendBtn.disabled = false;
          sendBtn.innerHTML = "Send";
        }
      }
    };

    /**
     * Socket callbacks: handles auto-reconnect logic.
     */
    const socketCallback = {
      onReconnect: (attempt) => {
        console.log(`Reconnecting attempt #${attempt}, resetting isLoading`);
        isLoading = false;
        const sendBtn = container.querySelector("#akvo-rag-send-btn");
        if (sendBtn) {
          sendBtn.disabled = false;
          sendBtn.innerHTML = "Send";
        }
      },
    };

    // If no KB is selected initially, handle the "Start Chat" button logic
    if (!options.kb_id && options.kb_options?.length) {
      const startBtn = container.querySelector("#akvo-start-chat-btn");

      // Get the Start Chat button and KB radio buttons
      const kbRadioButtons = container.querySelectorAll(
        "input[name='akvo-kb']"
      );

      // Initially disable the Start Chat button
      startBtn.disabled = true;

      // Enable the button once a KB is selected
      kbRadioButtons.forEach((radio) => {
        radio.addEventListener("change", () => {
          startBtn.disabled = false;
        });
      });

      // start chat button click logic
      startBtn.addEventListener("click", () => {
        const selectedKB = container.querySelector(
          "input[name='akvo-kb']:checked"
        );
        if (!selectedKB) {
          alert("Please select a knowledge base to start the conversation.");
          return;
        }

        // Set the selected KB ID
        options.kb_id = parseInt(selectedKB.value, 10);

        // Remove the KB selector UI
        const kbOptionsEl = container.querySelector("#akvo-kb-options");
        if (kbOptionsEl) kbOptionsEl.remove();

        // Replace "Start Chat" button with input and send button
        const inputContainer = container.querySelector(
          "#akvo-rag-input-container"
        );
        inputContainer.innerHTML = `
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
        `;

        // Connect WebSocket with the selected KB
        wsConnection = connectWebSocket(
          { ...options, autoReconnect: true, visitorId },
          onMessage,
          socketCallback
        );

        // Notify the user that chat is ready
        const body = container.querySelector("#akvo-rag-body");
        const msg = document.createElement("p");
        msg.className = "akvo-msg-system";
        msg.textContent = DEFAULT_WELCOME_MESSAGE;
        body.appendChild(msg);

        // Bind input & send button logic
        const input = container.querySelector("#akvo-rag-input");
        const sendBtn = container.querySelector("#akvo-rag-send-btn");

        // Send on Enter key
        input.addEventListener("keypress", (e) => {
          if (e.key === "Enter") sendBtn.click();
        });

        // Send button click logic
        sendBtn.addEventListener("click", () => {
          if (isLoading) return;
          const text = input.value.trim();
          if (!text || wsConnection.socket?.readyState !== WebSocket.OPEN)
            return;

          chatHistory.push({ role: "user", content: text });
          const lastMessages = chatHistory.slice(CHAT_HISTORY_SLICE);

          wsConnection.socket.send(
            JSON.stringify({
              type: "chat",
              kb_id: options.kb_id,
              messages: lastMessages,
            })
          );

          appendMessageToBody("user", text);
          input.value = "";
          currentAssistantMsgEl = null;
          sendBtn.disabled = true;
          sendBtn.innerHTML = `<span class="akvo-send-spinner"></span>`;
          isLoading = true;
        });
      });
    } else {
      // If KB is already set, show input and send button directly
      const input = container.querySelector("#akvo-rag-input");
      const sendBtn = container.querySelector("#akvo-rag-send-btn");

      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendBtn.click();
      });

      sendBtn.addEventListener("click", () => {
        if (isLoading) return;
        const text = input.value.trim();
        if (!text || wsConnection?.socket?.readyState !== WebSocket.OPEN)
          return;

        chatHistory.push({ role: "user", content: text });
        const lastMessages = chatHistory.slice(CHAT_HISTORY_SLICE);

        wsConnection.socket.send(
          JSON.stringify({
            type: "chat",
            kb_id: options.kb_id,
            messages: lastMessages,
          })
        );

        appendMessageToBody("user", text);
        input.value = "";
        currentAssistantMsgEl = null;
        sendBtn.disabled = true;
        sendBtn.innerHTML = `<span class="akvo-send-spinner"></span>`;
        isLoading = true;
      });

      // Initialize the WebSocket connection if KB already known
      wsConnection = connectWebSocket(
        { ...options, autoReconnect: true, visitorId },
        onMessage,
        socketCallback
      );
    }
  } else {
    // If widget already exists, ensure it is not minimized
    container.classList.remove("minimized");
    const btn = container.querySelector("#akvo-rag-close-btn");
    btn.innerHTML = `<i class="fa fa-window-minimize" aria-hidden="true"></i>`;
  }
}
