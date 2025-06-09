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
  // Try to get the chat container element; create it if it doesn't exist
  let container = document.getElementById("akvo-rag");
  const visitorId = getOrCreateVisitorId();

  if (!container) {
    // Create the container element for the chat widget
    container = document.createElement("div");
    container.id = "akvo-rag";

    // Set the inner HTML of the container, including header, body, and input
    container.innerHTML = `
      <div id="akvo-rag-header">
        ${options.title || "Chatbot"}
        <button id="akvo-rag-close-btn" class="akvo-rag-close-btn">
          <i class="fa fa-window-minimize" aria-hidden="true"></i>
        </button>
      </div>
      <div id="akvo-rag-body" class="akvo-rag-body">
        <p class="akvo-msg-system">Hello! How can I help you today?</p>

        ${
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
                  After selecting, click "Send" to start chatting.
                </div>
              </div>
            `
            : ""
        }

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
          ${!options.kb_id ? "disabled" : ""}
        />
        <button id="akvo-rag-send-btn">Send</button>
      </div>
    `;

    // Set up minimize button and header click events
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

    // Append the container to the document body
    document.body.appendChild(container);

    /**
     * Handler for messages received from the WebSocket connection.
     * It processes different types of messages: info, start, response_chunk, end.
     */
    const onMessage = (data) => {
      if (data.type === "info") {
        // System information message (e.g., server status)
        appendMessageToBody("system", data.message);
      } else if (data.type === "start") {
        // Start of an assistant message (streaming)
        citations = [];
        messageCounter++;
        currentAssistantMsgEl = appendMessageToBody(
          "assistant",
          "",
          true,
          messageCounter
        );
      } else if (data.type === "response_chunk") {
        // Streaming response chunk from the assistant
        if (data?.citations?.length) {
          citations = [...citations, ...data.citations];
        }
        updateStreamingAssistantMessage(data.content, currentAssistantMsgEl);
      } else if (data.type === "end") {
        // End of the assistant's response, attach citations and store in history
        const el = document.querySelector(
          `#akvo-msg-assistant-${messageCounter}`
        );
        if (el) {
          replaceCitations(el, citations);

          // Save the assistant message to the chat history if available
          if (el?.rawText) {
            chatHistory.push({
              role: "assistant",
              content: el.rawText,
            });
          }
        }

        // Reset input and loading state
        isLoading = false;
        sendBtn.disabled = false;
        sendBtn.innerHTML = "Send";
      }
    };

    /**
     * WebSocket callbacks, including reconnection logic.
     */
    const socketCallback = {
      onReconnect: (attempt) => {
        console.log(`Reconnecting attempt #${attempt}, resetting isLoading`);
        isLoading = false;
        sendBtn.disabled = false;
        sendBtn.innerHTML = "Send";
      },
    };

    // Enable auto-reconnect for the WebSocket connection
    const autoReconnect = true;

    // Initialize the WebSocket connection
    if (options.kb_id) {
      // initialize the WebSocket connection with the provided kb_id
      wsConnection = connectWebSocket(
        { ...options, autoReconnect, visitorId },
        onMessage,
        socketCallback
      );
    }

    // Get input and send button elements
    const input = container.querySelector("#akvo-rag-input");
    const sendBtn = container.querySelector("#akvo-rag-send-btn");

    // Handle pressing Enter to send a message
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendBtn.click();
    });

    // Handle sending a message when the send button is clicked
    sendBtn.addEventListener("click", () => {
      if (isLoading) return;

      // If kb_id is not set, prompt user to select KB first
      if (!options.kb_id) {
        const selectedKB = container.querySelector(
          "input[name='akvo-kb']:checked"
        );
        if (!selectedKB) {
          alert("Please select a knowledge base to start the conversation.");
          return;
        }
        options.kb_id = parseInt(selectedKB.value, 10);
        const kbOptionsEl = container.querySelector("#akvo-kb-options");
        if (kbOptionsEl) kbOptionsEl.remove();
      }

      // Explicitly connect to the WebSocket only if it's not already connected
      if (!wsConnection) {
        // initialize the WebSocket connection with selected kb_id from kb_options
        wsConnection = connectWebSocket(
          { ...options, autoReconnect: true, visitorId },
          onMessage,
          socketCallback
        );
      }

      const text = input.value.trim();
      if (!text || wsConnection.socket?.readyState !== WebSocket.OPEN) return;

      // Add user message to history
      chatHistory.push({ role: "user", content: text });

      // Limit to last 10 messages
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
  } else {
    // If container already exists, ensure it is not minimized
    container.classList.remove("minimized");
    const btn = container.querySelector("#akvo-rag-close-btn");
    btn.innerHTML = `<i class="fa fa-window-minimize" aria-hidden="true"></i>`;
  }
}
