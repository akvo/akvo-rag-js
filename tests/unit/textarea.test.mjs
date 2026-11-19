import { test } from "node:test";
import assert from "node:assert";

let docElements = new Map();

function createMockElement(tagName = "div") {
  const el = {
    tagName: tagName.toUpperCase(),
    id: "",
    className: "",
    innerHTML: "",
    value: "",
    scrollHeight: 38,
    setAttribute(attr, val) {
      this[attr] = val;
    },
    getAttribute(attr) {
      return this[attr] || null;
    },
    style: {
      _props: {},
      height: "",
      display: "",
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
      const evt = {
        type,
        target: this,
        key: event?.key || "",
        shiftKey: !!event?.shiftKey,
        defaultPrevented: false,
        preventDefault() {
          this.defaultPrevented = true;
        },
        stopPropagation() {},
        ...event,
      };
      for (const cb of cbs) {
        cb(evt);
      }
      return evt;
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
        this.parentElement.childNodes = this.parentElement.childNodes.filter((c) => c !== this);
        this.parentElement.children = this.parentElement.children.filter((c) => c !== this);
        this.parentElement = null;
      }
    },
    querySelector(selector) {
      return this._find(selector);
    },
    querySelectorAll(selector) {
      return [];
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
          const mockChild = createMockElement(
            id.includes("btn") ? "button" : id.includes("input") ? "textarea" : "div"
          );
          mockChild.id = id;
          this.appendChild(mockChild);
          return mockChild;
        }
      }
      return null;
    },
  };
  return el;
}

function setupMockDOM() {
  docElements.clear();
  const body = createMockElement("body");
  body.id = "body";

  globalThis.window = {
    innerWidth: 1024,
    innerHeight: 768,
    addEventListener() {},
    removeEventListener() {},
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
    querySelectorAll() {
      return [];
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
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };

  globalThis.DOMPurify = {
    sanitize: (s) => s,
  };

  if (!globalThis.crypto?.randomUUID) {
    globalThis.crypto = { randomUUID: () => "mock-uuid-1234" };
  }

  globalThis.WebSocket = class {
    static OPEN = 1;
    constructor() {
      this.readyState = 1;
      this.sent = [];
    }
    send(data) {
      this.sent.push(data);
    }
    close() {}
  };
}

test("Textarea - Input renders as a textarea tag", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const chatbox = new AkvoRagChatbox({ kb_id: 123 });

  const input = chatbox.container.querySelector("#akvo-rag-input");
  assert.ok(input, "Input element should exist");
  assert.strictEqual(input.tagName, "TEXTAREA", "Element must be a TEXTAREA");

  chatbox.destroy();
});

test("Textarea - Auto-resizes height on input event up to max 120px", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const chatbox = new AkvoRagChatbox({ kb_id: 123 });

  const input = chatbox.container.querySelector("#akvo-rag-input");

  // Moderate text (e.g. 70px)
  input.scrollHeight = 70;
  input.dispatchEvent({ type: "input" });
  assert.strictEqual(input.style.height, "70px", "Textarea should expand to scrollHeight (70px)");

  // Very long text exceeding 120px
  input.scrollHeight = 250;
  input.dispatchEvent({ type: "input" });
  assert.strictEqual(input.style.height, "120px", "Textarea height should be capped at 120px");

  chatbox.destroy();
});

test("Textarea - Keyboard navigation: Enter submits, Shift+Enter does not", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const chatbox = new AkvoRagChatbox({ kb_id: 123, wsURL: "ws://localhost" });

  const input = chatbox.container.querySelector("#akvo-rag-input");
  input.value = "Hello World\nSecond Line";

  // Shift+Enter: newline, should NOT submit
  const shiftEnterEvt = input.dispatchEvent({
    type: "keydown",
    key: "Enter",
    shiftKey: true,
  });
  assert.strictEqual(shiftEnterEvt.defaultPrevented, false, "Shift+Enter should not be prevented");
  assert.strictEqual(input.value, "Hello World\nSecond Line", "Value should be preserved");

  // Plain Enter: submit, should preventDefault and dispatch
  const enterEvt = input.dispatchEvent({
    type: "keydown",
    key: "Enter",
    shiftKey: false,
  });
  assert.strictEqual(enterEvt.defaultPrevented, true, "Plain Enter should call preventDefault");
  assert.strictEqual(input.value, "", "Value should be cleared after submit");
  assert.strictEqual(input.style.height, "auto", "Height should be reset after submit");

  chatbox.destroy();
});
