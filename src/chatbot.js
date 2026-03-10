import { connectWebSocket } from "./lib/websocket.js";
import {
  appendMessageToBody,
  updateStreamingAssistantMessage,
} from "./utils/chat-renderer.js";
import { replaceCitations } from "./utils/citations-popover.js";
import { getOrCreateVisitorId } from "./utils/uuid.js";

const CHAT_HISTORY_SLICE = -10;
const DEFAULT_WELCOME_MESSAGE = "Hello! How can I help you today?";

/**
 * AkvoRagChatbox class encapsulates the chat widget state and logic.
 */
export class AkvoRagChatbox {
  constructor(options = {}) {
    this.options = options;
    this.wsConnection = null;
    this.currentAssistantMsgEl = null;
    this.isLoading = false;
    this.citations = [];
    this.messageCounter = 0;
    this.chatHistory = [];
    this.visitorId = getOrCreateVisitorId();
    this.container = null;

    this._onMessage = this._onMessage.bind(this);
    this._handleSend = this._handleSend.bind(this);
    this._handleStartChat = this._handleStartChat.bind(this);

    this.init();
  }

  /**
   * Initializes the widget UI and connection.
   */
  init() {
    this.container = document.getElementById("akvo-rag");
    if (this.container) {
      this.container.classList.remove("minimized");
      const btn = this.container.querySelector("#akvo-rag-close-btn");
      if (btn)
        btn.innerHTML = `<i class="fa fa-window-minimize" aria-hidden="true"></i>`;
      return;
    }

    this._createUI();
    this._bindEvents();

    if (this.options.kb_id) {
      this._connect();
    }
  }

  /**
   * Destroys the widget, closing connections and removing DOM elements.
   */
  destroy() {
    if (this.wsConnection) {
      this.wsConnection.close();
    }
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }

  _createUI() {
    this.container = document.createElement("div");
    this.container.id = "akvo-rag";
    this.container.innerHTML = `
      <div id="akvo-rag-header">
        ${this.options.title || "Chatbot"}
        <button id="akvo-rag-close-btn" class="akvo-rag-close-btn">
          <i class="fa fa-window-minimize" aria-hidden="true"></i>
        </button>
      </div>
      <div id="akvo-rag-body" class="akvo-rag-body">
        ${
          !this.options.kb_id && this.options.kb_options?.length
            ? `
              <div id="akvo-kb-options" class="akvo-kb-options">
                <p>Please select a knowledge base to continue:</p>
                ${this.options.kb_options
                  .map(
                    (kb) => `
                    <div class="kb-option">
                      <input type="radio" id="kb-${kb.kb_id}" name="akvo-kb" value="${kb.kb_id}">
                      <label for="kb-${kb.kb_id}">${kb.label}</label>
                    </div>
                  `,
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
          !this.options.kb_id
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
    document.body.appendChild(this.container);
  }

  _bindEvents() {
    const header = this.container.querySelector("#akvo-rag-header");
    const closeBtn = this.container.querySelector("#akvo-rag-close-btn");

    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.container.classList.toggle("minimized");
    });

    header.addEventListener("click", () => {
      if (this.container.classList.contains("minimized")) {
        this.container.classList.remove("minimized");
      }
    });

    if (!this.options.kb_id && this.options.kb_options?.length) {
      const startBtn = this.container.querySelector("#akvo-start-chat-btn");
      const kbRadios = this.container.querySelectorAll("input[name='akvo-kb']");

      kbRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
          startBtn.disabled = false;
        });
      });

      startBtn.addEventListener("click", this._handleStartChat);
    } else {
      this._bindInputEvents();
    }
  }

  _bindInputEvents() {
    const input = this.container.querySelector("#akvo-rag-input");
    const sendBtn = this.container.querySelector("#akvo-rag-send-btn");

    if (input && sendBtn) {
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this._handleSend();
      });
      sendBtn.addEventListener("click", this._handleSend);
    }
  }

  _connect() {
    const socketCallback = {
      onReconnect: (attempt) => {
        console.log(`Reconnecting attempt #${attempt}, resetting isLoading`);
        this.isLoading = false;
        this._updateSendButtonState();
      },
    };

    this.wsConnection = connectWebSocket(
      { ...this.options, autoReconnect: true, visitorId: this.visitorId },
      this._onMessage,
      socketCallback,
    );
  }

  _handleStartChat() {
    const selectedKB = this.container.querySelector(
      "input[name='akvo-kb']:checked",
    );
    if (!selectedKB) return;

    this.options.kb_id = parseInt(selectedKB.value, 10);

    const kbOptionsEl = this.container.querySelector("#akvo-kb-options");
    if (kbOptionsEl) kbOptionsEl.remove();

    const inputContainer = this.container.querySelector(
      "#akvo-rag-input-container",
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

    this._connect();

    const body = this.container.querySelector("#akvo-rag-body");
    const msg = document.createElement("p");
    msg.className = "akvo-msg-system";
    msg.textContent = DEFAULT_WELCOME_MESSAGE;
    body.appendChild(msg);

    this._bindInputEvents();
  }

  _handleSend() {
    if (this.isLoading) return;
    const input = this.container.querySelector("#akvo-rag-input");
    const text = input.value.trim();

    if (!text || this.wsConnection?.socket?.readyState !== WebSocket.OPEN)
      return;

    this.chatHistory.push({ role: "user", content: text });
    const lastMessages = this.chatHistory.slice(CHAT_HISTORY_SLICE);

    this.wsConnection.socket.send(
      JSON.stringify({
        type: "chat",
        kb_id: this.options.kb_id,
        messages: lastMessages,
      }),
    );

    appendMessageToBody("user", text);
    input.value = "";
    this.currentAssistantMsgEl = null;
    this.isLoading = true;
    this._updateSendButtonState();
  }

  _updateSendButtonState() {
    const sendBtn = this.container.querySelector("#akvo-rag-send-btn");
    if (!sendBtn) return;

    if (this.isLoading) {
      sendBtn.disabled = true;
      sendBtn.innerHTML = `<span class="akvo-send-spinner"></span>`;
    } else {
      sendBtn.disabled = false;
      sendBtn.innerHTML = "Send";
    }
  }

  _onMessage(data) {
    if (data.type === "info") {
      appendMessageToBody("system", data.message);
    } else if (data.type === "start") {
      this.citations = [];
      this.messageCounter++;
      this.currentAssistantMsgEl = appendMessageToBody(
        "assistant",
        "",
        true,
        this.messageCounter,
      );
    } else if (data.type === "response_chunk") {
      if (data?.citations?.length) {
        data.citations.forEach((newCite) => {
          const existingIdx = this.citations.findIndex(
            (c) => c.id === newCite.id,
          );
          if (existingIdx > -1) {
            const existing = this.citations[existingIdx];
            const newHasData = newCite.text && newCite.metadata;
            const existingHasData = existing.text && existing.metadata;

            if (newHasData || !existingHasData) {
              this.citations[existingIdx] = newCite;
            }
          } else {
            this.citations.push(newCite);
          }
        });
      }
      updateStreamingAssistantMessage(data.content, this.currentAssistantMsgEl);
    } else if (data.type === "end") {
      const el = document.querySelector(
        `#akvo-msg-assistant-${this.messageCounter}`,
      );
      if (el) {
        replaceCitations(el, this.citations);
        if (el?.rawText) {
          this.chatHistory.push({
            role: "assistant",
            content: el.rawText,
          });
        }
      }
      this.isLoading = false;
      this._updateSendButtonState();
    }
  }
}

/**
 * Initializes the chat widget with the provided options.
 * Returns an instance of AkvoRagChatbox.
 */
export function initChat(options = {}) {
  return new AkvoRagChatbox(options);
}
