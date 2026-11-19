import { test } from "node:test";
import assert from "node:assert";

let docElements = new Map();
let mockStorage = new Map();

function createMockElement(tagName = "div") {
  const el = {
    tagName: tagName.toUpperCase(),
    id: "",
    className: "",
    innerHTML: "",
    value: "",
    scrollHeight: 38,
    _rect: { left: 0, top: 0, width: 56, height: 56, right: 56, bottom: 56 },
    getBoundingClientRect() {
      return this._rect;
    },
    setAttribute(attr, val) {
      this[attr] = val;
    },
    getAttribute(attr) {
      return this[attr] || null;
    },
    style: {
      _props: {},
      display: "",
      left: "",
      top: "",
      right: "",
      bottom: "",
      height: "",
      width: "",
      cursor: "",
      setProperty(key, value) {
        this._props[key] = value;
      },
      getPropertyValue(key) {
        return this._props[key] || "";
      },
    },
    childNodes: [],
    children: [],
    parentElement: null,
    listeners: {},
    classList: {
      _classes: new Set(),
      add(cls) {
        this._classes.add(cls);
      },
      remove(cls) {
        this._classes.delete(cls);
      },
      contains(cls) {
        return this._classes.has(cls);
      },
    },
    addEventListener(event, fn) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(fn);
    },
    removeEventListener(event, fn) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== fn);
    },
    dispatchEvent(event) {
      const type = typeof event === "string" ? event : event?.type;
      const cbs = this.listeners[type] || [];
      const evt =
        typeof event === "string"
          ? {
              type,
              target: this,
              preventDefault: () => {},
              stopPropagation: () => {},
            }
          : {
              target: this,
              preventDefault: () => {},
              stopPropagation: () => {},
              ...event,
            };
      for (const cb of cbs) {
        cb(evt);
      }
    },
    click() {
      this.dispatchEvent({ type: "click" });
    },
    appendChild(child) {
      child.parentElement = this;
      this.childNodes.push(child);
      this.children.push(child);
      return child;
    },
    remove() {
      if (this.id && docElements.has(this.id)) {
        docElements.delete(this.id);
      }
      if (this.parentElement) {
        this.parentElement.childNodes = this.parentElement.childNodes.filter(
          (c) => c !== this,
        );
        this.parentElement.children = this.parentElement.children.filter(
          (c) => c !== this,
        );
        this.parentElement = null;
      }
    },
    querySelector(selector) {
      return this._find(selector);
    },
    querySelectorAll(selector) {
      return this._findAll(selector);
    },
    _find(sel) {
      if (sel.startsWith("#")) {
        const id = sel.slice(1);
        if (this.id === id) return this;
        for (const child of this.children) {
          const match = child._find(sel);
          if (match) return match;
        }
        if (this.innerHTML && this.innerHTML.includes(`id="${id}"`)) {
          const mockChild = createMockElement(id.includes("btn") ? "button" : "div");
          mockChild.id = id;
          this.appendChild(mockChild);
          return mockChild;
        }
      } else if (sel.startsWith(".")) {
        const cls = sel.slice(1);
        if (this.classList.contains(cls)) return this;
        for (const child of this.children) {
          const match = child._find(sel);
          if (match) return match;
        }
      }
      return null;
    },
    _findAll(sel) {
      const res = [];
      if (sel.startsWith(".")) {
        const cls = sel.slice(1);
        if (this.classList.contains(cls)) res.push(this);
        for (const child of this.children) {
          res.push(...child._findAll(sel));
        }
      }
      return res;
    },
  };
  return el;
}

function setupMockDOM() {
  docElements.clear();
  mockStorage.clear();

  const body = createMockElement("body");
  body.id = "body";

  const windowListeners = {};

  globalThis.window = {
    innerWidth: 1024,
    innerHeight: 768,
    addEventListener(event, fn) {
      if (!windowListeners[event]) windowListeners[event] = [];
      windowListeners[event].push(fn);
    },
    removeEventListener(event, fn) {
      if (!windowListeners[event]) return;
      windowListeners[event] = windowListeners[event].filter((cb) => cb !== fn);
    },
    dispatchEvent(event) {
      const type = typeof event === "string" ? event : event?.type;
      const cbs = windowListeners[type] || [];
      const evt = typeof event === "string" ? { type } : event;
      for (const cb of cbs) {
        cb(evt);
      }
    },
  };

  globalThis.document = {
    body,
    getElementById(id) {
      if (docElements.has(id)) return docElements.get(id);
      return body.querySelector(`#${id}`);
    },
    querySelector(sel) {
      return body.querySelector(sel);
    },
    querySelectorAll(sel) {
      return body.querySelectorAll(sel);
    },
    createElement(tagName) {
      const el = createMockElement(tagName);
      let _id = "";
      Object.defineProperty(el, "id", {
        get: () => _id,
        set: (val) => {
          if (_id) docElements.delete(_id);
          _id = val;
          if (val) docElements.set(val, el);
        },
      });
      return el;
    },
  };

  globalThis.localStorage = {
    getItem: (key) => (mockStorage.has(key) ? mockStorage.get(key) : null),
    setItem: (key, val) => mockStorage.set(key, String(val)),
    removeItem: (key) => mockStorage.delete(key),
    clear: () => mockStorage.clear(),
  };

  if (!globalThis.crypto?.randomUUID) {
    globalThis.crypto = { randomUUID: () => "mock-uuid-1234" };
  }

  globalThis.WebSocket = class {
    static OPEN = 1;
    constructor() {
      this.readyState = 1;
    }
    send() {}
    close() {}
  };
}

test("Draggable - Options default to draggable: true, persistPosition: true", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const chatbox = new AkvoRagChatbox({ kb_id: 123 });

  assert.strictEqual(chatbox.options.draggable, true);
  assert.strictEqual(chatbox.options.persistPosition, true);
  assert.strictEqual(chatbox.options.storageKey, "akvo_rag_pos");
  assert.strictEqual(chatbox.options.dragThreshold, 6);

  chatbox.destroy();
});

test("Draggable - Movement < 6px triggers normal click/open", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const chatbox = new AkvoRagChatbox({ kb_id: 123, startMinimized: true });

  const launcher = chatbox.launcher;
  assert.strictEqual(chatbox.isMinimized, true);

  // Simulate mousedown at (100, 100)
  launcher.dispatchEvent({ type: "mousedown", clientX: 100, clientY: 100 });
  // Move 2px (below threshold 6px)
  globalThis.window.dispatchEvent({ type: "mousemove", clientX: 102, clientY: 101 });
  // Mouseup
  globalThis.window.dispatchEvent({ type: "mouseup", clientX: 102, clientY: 101 });
  // Normal click
  launcher.click();

  assert.strictEqual(chatbox.isMinimized, false, "Chatbox should open on click when movement < 6px");
  chatbox.destroy();
});

test("Draggable - Movement >= 6px drags launcher and suppresses open on click", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const chatbox = new AkvoRagChatbox({ kb_id: 123, startMinimized: true });

  const launcher = chatbox.launcher;
  launcher._rect = { left: 900, top: 650, width: 56, height: 56 };

  // Mousedown at (910, 660)
  launcher.dispatchEvent({ type: "mousedown", clientX: 910, clientY: 660 });
  // Move 50px left, 40px up
  globalThis.window.dispatchEvent({ type: "mousemove", clientX: 860, clientY: 620 });
  // Mouseup
  globalThis.window.dispatchEvent({ type: "mouseup", clientX: 860, clientY: 620 });
  // Click fired after drag release
  launcher.click();

  assert.strictEqual(chatbox.isMinimized, true, "Chatbox should remain minimized after drag release");
  assert.ok(launcher.style.left.includes("px"), "Launcher left position should be set in px");
  assert.ok(launcher.style.top.includes("px"), "Launcher top position should be set in px");
  assert.strictEqual(launcher.style.bottom, "auto");
  assert.strictEqual(launcher.style.right, "auto");

  chatbox.destroy();
});

test("Draggable - Viewport boundary clamping prevents dragging off-screen", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const chatbox = new AkvoRagChatbox({ kb_id: 123, startMinimized: true });

  const launcher = chatbox.launcher;
  launcher._rect = { left: 500, top: 400, width: 56, height: 56 };

  // Drag way beyond top-left screen boundary
  launcher.dispatchEvent({ type: "mousedown", clientX: 510, clientY: 410 });
  globalThis.window.dispatchEvent({ type: "mousemove", clientX: -200, clientY: -300 });
  globalThis.window.dispatchEvent({ type: "mouseup", clientX: -200, clientY: -300 });

  assert.strictEqual(launcher.style.left, "0px", "Should clamp left at 0px");
  assert.strictEqual(launcher.style.top, "0px", "Should clamp top at 0px");

  // Drag way beyond bottom-right screen boundary (1024 x 768)
  launcher.dispatchEvent({ type: "mousedown", clientX: 10, clientY: 10 });
  globalThis.window.dispatchEvent({ type: "mousemove", clientX: 2000, clientY: 2000 });
  globalThis.window.dispatchEvent({ type: "mouseup", clientX: 2000, clientY: 2000 });

  // Max left = 1024 - 56 = 968px, Max top = 768 - 56 = 712px
  assert.strictEqual(launcher.style.left, "968px", "Should clamp max left to 968px");
  assert.strictEqual(launcher.style.top, "712px", "Should clamp max top to 712px");

  chatbox.destroy();
});

test("Draggable - Position persistence saves to localStorage and restores on init", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");

  // Instance 1 drags launcher to (200, 300)
  const chatbox1 = new AkvoRagChatbox({ kb_id: 123, startMinimized: true, storageKey: "test_rag_pos" });
  const launcher1 = chatbox1.launcher;
  launcher1._rect = { left: 100, top: 100, width: 56, height: 56 };

  launcher1.dispatchEvent({ type: "mousedown", clientX: 110, clientY: 110 });
  globalThis.window.dispatchEvent({ type: "mousemove", clientX: 210, clientY: 310 });
  globalThis.window.dispatchEvent({ type: "mouseup", clientX: 210, clientY: 310 });

  const savedRaw = mockStorage.get("test_rag_pos");
  assert.ok(savedRaw, "Position should be persisted in localStorage");
  const savedPos = JSON.parse(savedRaw);
  assert.strictEqual(savedPos.left, 200);
  assert.strictEqual(savedPos.top, 300);

  chatbox1.destroy();

  // Instance 2 initializes and restores position
  const chatbox2 = new AkvoRagChatbox({ kb_id: 123, startMinimized: true, storageKey: "test_rag_pos" });
  assert.strictEqual(chatbox2.launcher.style.left, "200px");
  assert.strictEqual(chatbox2.launcher.style.top, "300px");

  chatbox2.destroy();
});

test("Draggable - Quadrant-aware window anchoring when opening from dragged launcher", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");

  // Launcher dragged to top-left quadrant (50, 60)
  mockStorage.set("akvo_rag_pos", JSON.stringify({ left: 50, top: 60 }));

  const chatbox = new AkvoRagChatbox({ kb_id: 123, startMinimized: true, width: 360, height: 500 });
  chatbox.container._rect = { left: 0, top: 0, width: 360, height: 500 };

  chatbox.open();

  // For top-left quadrant (left < 512, top < 384), window should anchor at top-left
  assert.strictEqual(chatbox.container.style.left, "50px");
  assert.strictEqual(chatbox.container.style.top, "60px");

  chatbox.destroy();
});

test("Draggable - Chat window header is draggable and updates position", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const chatbox = new AkvoRagChatbox({ kb_id: 123, startMinimized: false, width: 360, height: 500 });

  const header = chatbox.container.querySelector("#akvo-rag-header");
  chatbox.container._rect = { left: 600, top: 200, width: 360, height: 500 };

  // Drag header by 40px left, 30px down
  header.dispatchEvent({ type: "mousedown", clientX: 650, clientY: 220 });
  globalThis.window.dispatchEvent({ type: "mousemove", clientX: 610, clientY: 250 });
  globalThis.window.dispatchEvent({ type: "mouseup", clientX: 610, clientY: 250 });

  assert.strictEqual(chatbox.container.style.left, "560px");
  assert.strictEqual(chatbox.container.style.top, "230px");

  // Close chatbox -> launcher should restore aligned with dragged window coordinates
  chatbox.close();
  assert.strictEqual(chatbox.launcher.style.left, "560px");

  chatbox.destroy();
});

test("Draggable - Touch dragging works across touchstart, touchmove, and touchend", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const chatbox = new AkvoRagChatbox({ kb_id: 123, startMinimized: true });

  const launcher = chatbox.launcher;
  launcher._rect = { left: 400, top: 400, width: 56, height: 56 };

  launcher.dispatchEvent({
    type: "touchstart",
    touches: [{ clientX: 410, clientY: 410 }],
  });
  globalThis.window.dispatchEvent({
    type: "touchmove",
    touches: [{ clientX: 450, clientY: 460 }],
  });
  globalThis.window.dispatchEvent({
    type: "touchend",
    changedTouches: [{ clientX: 450, clientY: 460 }],
  });

  assert.strictEqual(launcher.style.left, "440px");
  assert.strictEqual(launcher.style.top, "450px");

  chatbox.destroy();
});

test("Draggable - draggable: false disables drag initialization", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const chatbox = new AkvoRagChatbox({ kb_id: 123, draggable: false });

  const launcher = chatbox.launcher;
  launcher._rect = { left: 300, top: 300, width: 56, height: 56 };

  launcher.dispatchEvent({ type: "mousedown", clientX: 310, clientY: 310 });
  globalThis.window.dispatchEvent({ type: "mousemove", clientX: 350, clientY: 350 });
  globalThis.window.dispatchEvent({ type: "mouseup", clientX: 350, clientY: 350 });

  assert.strictEqual(launcher.style.left, "", "Left style should remain untouched when draggable: false");

  chatbox.destroy();
});

test("Draggable - persistPosition: false does not save coordinates to localStorage", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const chatbox = new AkvoRagChatbox({ kb_id: 123, persistPosition: false, storageKey: "no_persist_test" });

  const launcher = chatbox.launcher;
  launcher._rect = { left: 100, top: 100, width: 56, height: 56 };

  launcher.dispatchEvent({ type: "mousedown", clientX: 110, clientY: 110 });
  globalThis.window.dispatchEvent({ type: "mousemove", clientX: 150, clientY: 150 });
  globalThis.window.dispatchEvent({ type: "mouseup", clientX: 150, clientY: 150 });

  assert.strictEqual(mockStorage.get("no_persist_test"), undefined, "Storage key should not be populated");

  chatbox.destroy();
});

test("Draggable - Header close button click does not initiate drag", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const chatbox = new AkvoRagChatbox({ kb_id: 123, startMinimized: false });

  const closeBtn = chatbox.container.querySelector("#akvo-rag-close-btn");
  chatbox.container._rect = { left: 500, top: 200, width: 360, height: 500 };

  closeBtn.dispatchEvent({ type: "mousedown", clientX: 510, clientY: 210, target: closeBtn });
  globalThis.window.dispatchEvent({ type: "mousemove", clientX: 550, clientY: 250 });
  globalThis.window.dispatchEvent({ type: "mouseup", clientX: 550, clientY: 250 });

  assert.strictEqual(chatbox.container.style.left, "", "Window position should not change on close button click");

  chatbox.destroy();
});
