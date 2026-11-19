import DOMPurify from "dompurify";
import { connectWebSocket } from "./lib/websocket.js";
import {
  appendMessageToBody,
  updateStreamingAssistantMessage,
} from "./utils/chat-renderer.js";
import {
  replaceCitations,
  removeAllPopovers,
} from "./utils/citations-popover.js";
import { getOrCreateVisitorId } from "./utils/uuid.js";

const CHAT_HISTORY_SLICE = -10;
const DEFAULT_WELCOME_MESSAGE = "Hello! How can I help you today?";

/**
 * AkvoRagChatbox class encapsulates the chat widget state and logic.
 */
export class AkvoRagChatbox {
  constructor(options = {}) {
    this.options = {
      draggable: true,
      persistPosition: true,
      storageKey: "akvo_rag_pos",
      dragThreshold: 6,
      ...options,
    };
    if (options.draggable !== undefined) {
      this.options.draggable = Boolean(options.draggable);
    }
    if (options.persistPosition !== undefined) {
      this.options.persistPosition = Boolean(options.persistPosition);
    }
    if (options.dragThreshold !== undefined) {
      const parsedThresh = Number(options.dragThreshold);
      this.options.dragThreshold =
        Number.isFinite(parsedThresh) && parsedThresh >= 0 ? parsedThresh : 6;
    }
    if (typeof options.storageKey === "string" && options.storageKey.trim()) {
      this.options.storageKey = options.storageKey.trim();
    }

    this.showLauncher =
      this.options.showLauncher !== undefined
        ? Boolean(this.options.showLauncher)
        : true;
    this.isMinimized =
      this.options.startMinimized !== undefined
        ? Boolean(this.options.startMinimized)
        : this.showLauncher;
    this.wsConnection = null;
    this.currentAssistantMsgEl = null;
    this.isLoading = false;
    this.citations = [];
    this.messageCounter = 0;
    this.chatHistory = [];
    this.visitorId = getOrCreateVisitorId();
    this.container = null;
    this.launcher = null;
    this.currentPosition = null;
    this._activeDragCleanup = [];
    this._suppressNextClick = false;

    this._onMessage = this._onMessage.bind(this);
    this._handleSend = this._handleSend.bind(this);
    this._handleStartChat = this._handleStartChat.bind(this);

    this.init();
  }

  /**
   * Initializes the widget UI and connection.
   */
  init() {
    const savedPos = this._loadSavedPosition();
    if (savedPos) {
      this.currentPosition = savedPos;
    }

    this.container = document.getElementById("akvo-rag");
    this.launcher = document.getElementById("akvo-rag-launcher");

    if (this.container) {
      this._applyCustomStyles(this.container, false);
      if (this.launcher) {
        this._applyCustomStyles(this.launcher, true);
        if (this.currentPosition) {
          this._applyPosition(this.launcher, this.currentPosition);
        }
      }
      if (this.isMinimized) {
        this.close();
      } else {
        this.open();
      }
      return;
    }

    if (this.showLauncher) {
      this._createLauncher();
    } else {
      this.launcher = null;
    }

    this._createUI();
    this._bindEvents();

    if (this.isMinimized) {
      this.close();
    } else {
      this.open();
    }

    if (this.options.kb_id) {
      this._connect();
    }
  }

  /**
   * Loads persisted widget coordinates from localStorage.
   */
  _loadSavedPosition() {
    if (!this.options.persistPosition) return null;
    try {
      if (typeof globalThis.localStorage?.getItem === "function") {
        const raw = globalThis.localStorage.getItem(this.options.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (
            parsed &&
            typeof parsed.left === "number" &&
            Number.isFinite(parsed.left) &&
            typeof parsed.top === "number" &&
            Number.isFinite(parsed.top)
          ) {
            return { left: parsed.left, top: parsed.top };
          }
        }
      }
    } catch {
      // LocalStorage access or parse error
    }
    return null;
  }

  /**
   * Persists widget coordinates to localStorage.
   */
  _savePosition(pos) {
    if (!pos || typeof pos.left !== "number" || typeof pos.top !== "number") {
      return;
    }
    this.currentPosition = { left: pos.left, top: pos.top };
    if (!this.options.persistPosition) return;
    try {
      if (typeof globalThis.localStorage?.setItem === "function") {
        globalThis.localStorage.setItem(
          this.options.storageKey,
          JSON.stringify(this.currentPosition),
        );
      }
    } catch {
      // LocalStorage quota or access error
    }
  }

  /**
   * Applies left/top coordinates to an element, resetting bottom/right.
   */
  _applyPosition(element, pos) {
    if (!element || !element.style || !pos) return;
    element.style.left = `${pos.left}px`;
    element.style.top = `${pos.top}px`;
    element.style.bottom = "auto";
    element.style.right = "auto";
  }

  /**
   * Anchors the chat window relative to the launcher based on screen quadrant.
   */
  _anchorWindowToLauncher() {
    if (!this.container || !this.currentPosition) return;

    const L_left = this.currentPosition.left;
    const L_top = this.currentPosition.top;

    const L_rect =
      typeof this.launcher?.getBoundingClientRect === "function"
        ? this.launcher.getBoundingClientRect()
        : { width: 56, height: 56 };
    const L_width = L_rect.width || 56;
    const L_height = L_rect.height || 56;

    const W_rect =
      typeof this.container.getBoundingClientRect === "function"
        ? this.container.getBoundingClientRect()
        : { width: 360, height: 500 };
    const W_width = W_rect.width || parseFloat(this.options.width) || 360;
    const W_height = W_rect.height || parseFloat(this.options.height) || 500;

    const winW = globalThis.window?.innerWidth || 1024;
    const winH = globalThis.window?.innerHeight || 768;

    // Horizontal anchoring
    let W_left = 0;
    if (L_left > winW / 2) {
      W_left = L_left + L_width - W_width;
    } else {
      W_left = L_left;
    }

    // Vertical anchoring
    let W_top = 0;
    if (L_top > winH / 2) {
      W_top = L_top + L_height - W_height;
    } else {
      W_top = L_top;
    }

    // Viewport boundary clamping
    const maxLeft = Math.max(0, winW - W_width);
    const maxTop = Math.max(0, winH - W_height);
    W_left = Math.max(0, Math.min(W_left, maxLeft));
    W_top = Math.max(0, Math.min(W_top, maxTop));

    this._applyPosition(this.container, { left: W_left, top: W_top });
  }

  /**
   * Sets up drag interactions on a handle element for moving a target element.
   */
  _makeDraggable(handleEl, targetEl, onDragEnd) {
    if (!handleEl || !targetEl || !this.options.draggable) return;

    let startPointerX = 0;
    let startPointerY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    let isDragging = false;

    const onPointerDown = (e) => {
      // Ignore if initiating click inside close/minimize button
      if (e.target && typeof e.target.closest === "function") {
        if (
          e.target.closest("#akvo-rag-close-btn") ||
          e.target.closest(".akvo-rag-close-btn")
        ) {
          return;
        }
      } else if (e.target && e.target.id === "akvo-rag-close-btn") {
        return;
      }

      if (e.type === "mousedown" && e.button !== undefined && e.button !== 0) {
        return;
      }

      const pointer = e.touches ? e.touches[0] : e;
      startPointerX = pointer.clientX;
      startPointerY = pointer.clientY;

      const rect =
        typeof targetEl.getBoundingClientRect === "function"
          ? targetEl.getBoundingClientRect()
          : { left: 0, top: 0, width: 56, height: 56 };

      const computedLeft = parseFloat(targetEl.style?.left);
      const computedTop = parseFloat(targetEl.style?.top);
      initialLeft = !isNaN(computedLeft) ? computedLeft : rect.left || 0;
      initialTop = !isNaN(computedTop) ? computedTop : rect.top || 0;

      isDragging = false;

      const onPointerMove = (moveEvt) => {
        const movePointer = moveEvt.touches ? moveEvt.touches[0] : moveEvt;
        const deltaX = movePointer.clientX - startPointerX;
        const deltaY = movePointer.clientY - startPointerY;
        const distance = Math.hypot(deltaX, deltaY);

        if (!isDragging && distance >= this.options.dragThreshold) {
          isDragging = true;
          this.isDragging = true;
          targetEl.classList?.add("akvo-is-dragging");
        }

        if (isDragging) {
          if (typeof moveEvt.preventDefault === "function") {
            moveEvt.preventDefault();
          }

          const winW = globalThis.window?.innerWidth || 1024;
          const winH = globalThis.window?.innerHeight || 768;
          const targetW =
            rect.width || parseFloat(targetEl.style?.width) || 56;
          const targetH =
            rect.height || parseFloat(targetEl.style?.height) || 56;

          const maxLeft = Math.max(0, winW - targetW);
          const maxTop = Math.max(0, winH - targetH);

          const newLeft = Math.max(0, Math.min(initialLeft + deltaX, maxLeft));
          const newTop = Math.max(0, Math.min(initialTop + deltaY, maxTop));

          this._applyPosition(targetEl, { left: newLeft, top: newTop });
        }
      };

      const onPointerUp = (upEvt) => {
        const movePointer = upEvt.changedTouches
          ? upEvt.changedTouches[0]
          : upEvt;
        const deltaX =
          (movePointer?.clientX !== undefined
            ? movePointer.clientX
            : startPointerX) - startPointerX;
        const deltaY =
          (movePointer?.clientY !== undefined
            ? movePointer.clientY
            : startPointerY) - startPointerY;
        const distance = Math.hypot(deltaX, deltaY);

        const win = globalThis.window || globalThis;
        win.removeEventListener?.("mousemove", onPointerMove);
        win.removeEventListener?.("mouseup", onPointerUp);
        win.removeEventListener?.("touchmove", onPointerMove);
        win.removeEventListener?.("touchend", onPointerUp);

        if (isDragging || distance >= this.options.dragThreshold) {
          isDragging = false;
          this.isDragging = false;
          this._suppressNextClick = true;
          targetEl.classList?.remove("akvo-is-dragging");

          const finalLeft = parseFloat(targetEl.style?.left) || 0;
          const finalTop = parseFloat(targetEl.style?.top) || 0;
          const pos = { left: finalLeft, top: finalTop };

          this._savePosition(pos);
          if (typeof onDragEnd === "function") {
            onDragEnd(pos);
          }
        }
      };

      const win = globalThis.window || globalThis;
      win.addEventListener?.("mousemove", onPointerMove, { passive: false });
      win.addEventListener?.("mouseup", onPointerUp);
      win.addEventListener?.("touchmove", onPointerMove, { passive: false });
      win.addEventListener?.("touchend", onPointerUp);

      this._activeDragCleanup.push(() => {
        win.removeEventListener?.("mousemove", onPointerMove);
        win.removeEventListener?.("mouseup", onPointerUp);
        win.removeEventListener?.("touchmove", onPointerMove);
        win.removeEventListener?.("touchend", onPointerUp);
      });
    };

    handleEl.addEventListener?.("mousedown", onPointerDown);
    handleEl.addEventListener?.("touchstart", onPointerDown, { passive: true });

    this._activeDragCleanup.push(() => {
      handleEl.removeEventListener?.("mousedown", onPointerDown);
      handleEl.removeEventListener?.("touchstart", onPointerDown);
    });
  }

  /**
   * Destroys the widget, closing connections and removing DOM elements.
   */
  destroy() {
    if (this.wsConnection) {
      this.wsConnection.close();
    }
    for (const cleanup of this._activeDragCleanup) {
      try {
        cleanup();
      } catch {
        // Safe unbind
      }
    }
    this._activeDragCleanup = [];
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    if (this.launcher) {
      this.launcher.remove();
      this.launcher = null;
    }
    removeAllPopovers();
  }

  /**
   * Opens / expands the chatbox and hides the launcher.
   */
  open() {
    this.isMinimized = false;
    if (this.currentPosition) {
      this._anchorWindowToLauncher();
    }
    if (this.container) {
      if (this.container.style) this.container.style.display = "flex";
      this.container.classList?.remove("minimized");
    }
    if (this.launcher) {
      if (this.launcher.style) this.launcher.style.display = "none";
    }
  }

  /**
   * Closes / minimizes the chatbox and restores the launcher.
   */
  close() {
    this.isMinimized = true;
    if (this.currentPosition && this.launcher) {
      this._applyPosition(this.launcher, this.currentPosition);
    }
    if (this.container) {
      if (this.showLauncher) {
        if (this.container.style) this.container.style.display = "none";
      } else {
        this.container.classList?.add("minimized");
      }
    }
    if (this.launcher) {
      if (this.launcher.style) this.launcher.style.display = "flex";
    }
  }

  /**
   * Alias for close.
   */
  minimize() {
    this.close();
  }

  _isValidCssColor(color) {
    if (!color || typeof color !== "string") return false;
    const trimmed = color.trim();
    if (/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) {
      return true;
    }
    if (/^(?:rgb|hsl)a?\(\s*[\d.%\s,/-]+\s*\)$/i.test(trimmed)) {
      return true;
    }
    const safeNamed =
      /^(?:teal|blue|green|red|purple|indigo|slate|gray|black|white|transparent)$/i;
    return safeNamed.test(trimmed);
  }

  _toCssDimension(value) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return `${value}px`;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (/^\d+(\.\d+)?$/.test(trimmed)) {
        return `${trimmed}px`;
      }
      if (/^\d+(\.\d+)?(px|rem|em|vh|vw|%)$/i.test(trimmed)) {
        return trimmed;
      }
    }
    return null;
  }

  _toSafeZIndex(value) {
    if (
      typeof value === "number" &&
      Number.isInteger(value) &&
      value >= 0 &&
      value <= 2147483647
    ) {
      return value;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (/^\d+$/.test(trimmed)) {
        const parsed = parseInt(trimmed, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 2147483647) {
          return parsed;
        }
      }
    }
    return null;
  }

  _applyCustomStyles(element, isLauncher = false) {
    if (!element || !element.style) return;

    // 1. Primary color
    if (
      this._isValidCssColor(this.options.primaryColor) &&
      typeof element.style.setProperty === "function"
    ) {
      element.style.setProperty(
        "--akvo-primary",
        this.options.primaryColor.trim(),
      );
    }

    // 2. Position (bottom-left or bottom-right)
    const pos = String(this.options.position || "").trim().toLowerCase();
    if (pos === "bottom-left") {
      element.classList?.add("akvo-position-left");
    }

    // 3. Z-Index
    const safeZIndex = this._toSafeZIndex(this.options.zIndex);
    if (safeZIndex !== null && typeof element.style.setProperty === "function") {
      const zVal = isLauncher ? Math.max(0, safeZIndex - 1) : safeZIndex;
      element.style.setProperty("--akvo-z-index", String(zVal));
      element.style.zIndex = String(zVal);
    }

    // 4. Dimensions & Radius (Container vs Launcher)
    if (isLauncher && typeof element.style.setProperty === "function") {
      const launcherSizeVal = this._toCssDimension(this.options.launcherSize);
      const launcherWidthVal =
        this._toCssDimension(this.options.launcherWidth) || launcherSizeVal;
      const launcherHeightVal =
        this._toCssDimension(this.options.launcherHeight) || launcherSizeVal;

      if (launcherWidthVal) {
        element.style.setProperty("--akvo-launcher-width", launcherWidthVal);
      }
      if (launcherHeightVal) {
        element.style.setProperty("--akvo-launcher-height", launcherHeightVal);
      }
    } else if (!isLauncher && typeof element.style.setProperty === "function") {
      const widthVal = this._toCssDimension(this.options.width);
      if (widthVal) {
        element.style.setProperty("--akvo-width", widthVal);
      }

      const heightVal = this._toCssDimension(this.options.height);
      if (heightVal) {
        element.style.setProperty("--akvo-height", heightVal);
      }

      const radiusVal = this._toCssDimension(this.options.borderRadius);
      if (radiusVal) {
        element.style.setProperty("--akvo-border-radius", radiusVal);
      }
    }
  }

  _sanitizeHtml(content, options) {
    if (typeof DOMPurify?.sanitize === "function") {
      return DOMPurify.sanitize(content, options);
    }
    if (typeof DOMPurify === "function") {
      try {
        const instance = DOMPurify(globalThis.window || globalThis);
        if (typeof instance?.sanitize === "function") {
          return instance.sanitize(content, options);
        }
      } catch {
        // fallback
      }
    }
    return String(content)
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/on\w+='[^']*'/gi, "");
  }

  _renderIcon(iconProp, defaultIconHtml = "") {
    if (!iconProp) {
      return defaultIconHtml;
    }

    const trimmed = String(iconProp).trim();

    // 1. Inline SVG
    if (trimmed.startsWith("<svg") || trimmed.includes("<svg")) {
      return this._sanitizeHtml(trimmed, {
        USE_PROFILES: { svg: true, svgFilters: true },
      });
    }

    // 2. Image URL (http, https, data:image, relative path, or common image extensions)
    const isUrl =
      /^(https?:\/\/|data:image\/|\/|\.\/)/i.test(trimmed) ||
      /\.(svg|png|jpe?g|webp|gif)(\?.*)?$/i.test(trimmed);

    if (isUrl) {
      const safeSrc = this._sanitizeHtml(trimmed);
      return `<img src="${safeSrc}" alt="icon" class="akvo-icon-img" />`;
    }

    // 3. CSS / FontAwesome class string
    const safeClass = this._sanitizeHtml(trimmed);
    return `<i class="${safeClass}" aria-hidden="true"></i>`;
  }

  _createLauncher() {
    this.launcher = document.createElement("button");
    this.launcher.id = "akvo-rag-launcher";
    this.launcher.className = "akvo-rag-launcher";
    if (typeof this.launcher.setAttribute === "function") {
      this.launcher.setAttribute("type", "button");
      this.launcher.setAttribute("aria-label", "Open chat");
    }

    const defaultIcon = `<i class="fa fa-comments" aria-hidden="true"></i>`;
    this.launcher.innerHTML = this._renderIcon(
      this.options.launcherIcon,
      defaultIcon,
    );

    this._applyCustomStyles(this.launcher, true);

    if (this.currentPosition) {
      this._applyPosition(this.launcher, this.currentPosition);
    }

    if (this.launcher.style) {
      this.launcher.style.display = this.isMinimized ? "flex" : "none";
    }

    if (document.body && typeof document.body.appendChild === "function") {
      document.body.appendChild(this.launcher);
    }

    this._makeDraggable(this.launcher, this.launcher, (pos) => {
      this.currentPosition = pos;
    });
  }

  _renderInputArea() {
    return `
      <textarea
        id="akvo-rag-input"
        rows="1"
        placeholder="Type a message..."
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
      ></textarea>
      <button id="akvo-rag-send-btn">Send</button>
    `;
  }

  _createUI() {
    this.container = document.createElement("div");
    this.container.id = "akvo-rag";

    this._applyCustomStyles(this.container, false);

    if (this.container.style) {
      this.container.style.display =
        this.showLauncher && this.isMinimized ? "none" : "flex";
    }

    if (this.currentPosition && !this.isMinimized) {
      this._anchorWindowToLauncher();
    }

    const headerIconHtml = this.options.headerIcon
      ? `<span class="akvo-header-icon">${this._renderIcon(this.options.headerIcon, "")}</span>`
      : "";

    this.container.innerHTML = `
      <div id="akvo-rag-header">
        <div class="akvo-header-title">
          ${headerIconHtml}
          <span>${this.options.title || "Chatbot"}</span>
        </div>
        <button id="akvo-rag-close-btn" class="akvo-rag-close-btn" aria-label="Minimize chat">
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
            : this._renderInputArea()
        }
      </div>
    `;
    document.body.appendChild(this.container);

    const header = this.container.querySelector("#akvo-rag-header");
    if (header) {
      this._makeDraggable(header, this.container, (pos) => {
        this.currentPosition = pos;
        if (this.launcher) {
          this._applyPosition(this.launcher, pos);
        }
      });
    }
  }

  _bindEvents() {
    const header = this.container?.querySelector("#akvo-rag-header");
    const closeBtn = this.container?.querySelector("#akvo-rag-close-btn");

    if (this.launcher && typeof this.launcher.addEventListener === "function") {
      this.launcher.addEventListener("click", () => {
        if (this._suppressNextClick) {
          this._suppressNextClick = false;
          return;
        }
        this.open();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.showLauncher) {
          this.close();
        } else {
          if (this.container?.classList?.contains("minimized")) {
            this.open();
          } else {
            this.close();
          }
        }
      });
    }

    if (header) {
      header.addEventListener("click", () => {
        if (this._suppressNextClick) {
          this._suppressNextClick = false;
          return;
        }
        if (!this.showLauncher) {
          if (this.container?.classList?.contains("minimized")) {
            this.open();
          }
        } else if (this.isMinimized) {
          this.open();
        }
      });
    }

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

  _autoResizeInput(input) {
    if (!input || !input.style) return;
    input.style.height = "auto";
    const scrollH =
      typeof input.scrollHeight === "number" ? input.scrollHeight : 38;
    const newHeight = Math.min(120, Math.max(38, scrollH));
    input.style.height = `${newHeight}px`;
  }

  _bindInputEvents() {
    const input = this.container.querySelector("#akvo-rag-input");
    const sendBtn = this.container.querySelector("#akvo-rag-send-btn");

    if (input && sendBtn) {
      input.addEventListener("input", () => {
        this._autoResizeInput(input);
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          if (typeof e.preventDefault === "function") {
            e.preventDefault();
          }
          this._handleSend();
        }
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
      onMaxReconnect: () => {
        this.isLoading = false;
        this._updateSendButtonState();
        appendMessageToBody(
          "system",
          "Connection to the chat server lost. Please check your network and refresh the page.",
        );
      },
    };

    this.wsConnection = connectWebSocket(
      {
        ...this.options,
        autoReconnect: true,
        visitorId: this.visitorId,
        onMaxReconnect: socketCallback.onMaxReconnect,
      },
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
    inputContainer.innerHTML = this._renderInputArea();

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
    if (input.style) {
      input.style.height = "auto";
    }
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
      const el =
        this.currentAssistantMsgEl ||
        document.querySelector(`#akvo-msg-assistant-${this.messageCounter}`);
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
