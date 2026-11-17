import { test } from "node:test";
import assert from "node:assert";

let docElements = new Map();

// Robust DOM mock helper for Node native test runner
function createMockElement(tagName = "div") {
  const el = {
    tagName: tagName.toUpperCase(),
    id: "",
    className: "",
    innerHTML: "",
    setAttribute(attr, val) {
      this[attr] = val;
    },
    getAttribute(attr) {
      return this[attr] || null;
    },
    style: {
      _props: {},
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
      toggle(cls, force) {
        if (force === true) {
          this._classes.add(cls);
          return true;
        } else if (force === false) {
          this._classes.delete(cls);
          return false;
        }
        if (this._classes.has(cls)) {
          this._classes.delete(cls);
          return false;
        } else {
          this._classes.add(cls);
          return true;
        }
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
      const evt = typeof event === "string" ? { type, stopPropagation: () => {} } : event;
      for (const cb of cbs) {
        cb(evt);
      }
    },
    click() {
      this.dispatchEvent({ type: "click", stopPropagation: () => {} });
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
          (c) => c !== this
        );
        this.parentElement.children = this.parentElement.children.filter(
          (c) => c !== this
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
        const idTagRegex = new RegExp(`<[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/(?:div|header|button|span)>`, "i");
        const matchTag = this.innerHTML && this.innerHTML.match(idTagRegex);
        if (matchTag) {
          const mockChild = createMockElement("div");
          mockChild.id = id;
          mockChild.innerHTML = matchTag[1];
          this.appendChild(mockChild);
          return mockChild;
        }
        const idRegex = new RegExp(`id=["']${id}["']`);
        if (this.innerHTML && idRegex.test(this.innerHTML)) {
          const mockChild = createMockElement("div");
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
        const clsRegex = new RegExp(`class=["'][^"']*\\b${cls}\\b[^"']*["']`);
        if (this.innerHTML && clsRegex.test(this.innerHTML)) {
          const mockChild = createMockElement("div");
          mockChild.classList.add(cls);
          this.appendChild(mockChild);
          return mockChild;
        }
      }
      return null;
    },
    _findAll(sel) {
      const results = [];
      if (sel.startsWith(".")) {
        const cls = sel.slice(1);
        if (this.classList.contains(cls)) results.push(this);
      }
      for (const child of this.children) {
        results.push(...child._findAll(sel));
      }
      return results;
    },
  };

  return el;
}

function setupMockDOM() {
  const body = createMockElement("body");
  docElements = new Map();

  globalThis.document = {
    body,
    getElementById(id) {
      if (docElements.has(id)) return docElements.get(id);
      return body.querySelector(`#${id}`);
    },
    createElement(tagName) {
      const el = createMockElement(tagName);
      // Hook ID changes to registry
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

test("Launcher - Default mounts with startMinimized: true", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const bot = new AkvoRagChatbox({ title: "IDC Assistant" });

  const launcher = bot.launcher;
  assert.ok(launcher, "Launcher button element must be created");
  assert.strictEqual(launcher.id, "akvo-rag-launcher");
  assert.strictEqual(launcher.style.display, "flex");
  assert.strictEqual(bot.container.style.display, "none");

  bot.destroy();
});

test("Launcher - startMinimized: false mounts chatbox open and launcher hidden", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const bot = new AkvoRagChatbox({ title: "IDC Assistant", startMinimized: false });

  assert.strictEqual(bot.container.style.display, "flex");
  assert.strictEqual(bot.launcher.style.display, "none");

  bot.destroy();
});

test("Launcher - Toggle interaction (open and minimize)", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const bot = new AkvoRagChatbox({ title: "IDC Assistant", startMinimized: true });

  // Initially minimized
  assert.strictEqual(bot.launcher.style.display, "flex");
  assert.strictEqual(bot.container.style.display, "none");

  // Click launcher -> opens chatbox, hides launcher
  bot.launcher.click();
  assert.strictEqual(bot.container.style.display, "flex");
  assert.strictEqual(bot.launcher.style.display, "none");

  // Click close button -> minimizes chatbox, restores launcher
  const closeBtn = bot.container.querySelector("#akvo-rag-close-btn");
  assert.ok(closeBtn, "Close button must exist in header");
  closeBtn.click();
  assert.strictEqual(bot.container.style.display, "none");
  assert.strictEqual(bot.launcher.style.display, "flex");

  bot.destroy();
});

test("Launcher - Custom launcherIcon (SVG string)", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const svgIcon = `<svg viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>`;
  const bot = new AkvoRagChatbox({ launcherIcon: svgIcon });

  assert.ok(bot.launcher.innerHTML.includes("<svg"), "Launcher should render custom SVG");
  assert.ok(bot.launcher.innerHTML.includes("viewBox=\"0 0 24 24\""));

  bot.destroy();
});

test("Launcher - Custom launcherIcon (Image URL)", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const imgUrl = "https://example.com/avatar.png";
  const bot = new AkvoRagChatbox({ launcherIcon: imgUrl });

  assert.ok(bot.launcher.innerHTML.includes("<img"), "Launcher should render img tag for URL");
  assert.ok(bot.launcher.innerHTML.includes("src=\"https://example.com/avatar.png\""));

  bot.destroy();
});

test("Launcher - Custom launcherIcon (CSS FontAwesome class)", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const bot = new AkvoRagChatbox({ launcherIcon: "fa fa-commenting" });

  assert.ok(bot.launcher.innerHTML.includes("<i class=\"fa fa-commenting\""));

  bot.destroy();
});

test("Launcher - Default icon fallback when launcherIcon omitted", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const bot = new AkvoRagChatbox({});

  assert.ok(
    bot.launcher.innerHTML.includes("fa fa-comments") || bot.launcher.innerHTML.includes("<svg"),
    "Launcher should have default fallback comment icon"
  );

  bot.destroy();
});

test("Header - Custom headerIcon rendered adjacent to title", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const bot = new AkvoRagChatbox({
    title: "Akvo Assistant",
    headerIcon: "https://example.com/logo.svg",
  });

  const header = bot.container.querySelector("#akvo-rag-header");
  assert.ok(header, "Header element must exist");
  assert.ok(
    bot.container.innerHTML.includes("https://example.com/logo.svg"),
    "Header should contain headerIcon"
  );
  assert.ok(
    bot.container.innerHTML.includes("Akvo Assistant"),
    "Header should contain title"
  );

  bot.destroy();
});

test("Theming - options.primaryColor sets --akvo-primary CSS custom property", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const bot = new AkvoRagChatbox({ primaryColor: "#007A78" });

  assert.strictEqual(
    bot.container.style.getPropertyValue("--akvo-primary"),
    "#007A78",
    "Container should have --akvo-primary property set"
  );
  assert.strictEqual(
    bot.launcher.style.getPropertyValue("--akvo-primary"),
    "#007A78",
    "Launcher should have --akvo-primary property set"
  );

  bot.destroy();
});

test("Security - _renderIcon sanitizes malicious SVG content via DOMPurify", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const maliciousSvg = `<svg><script>alert('xss')</script><circle cx="5" cy="5" r="5"/></svg>`;
  const bot = new AkvoRagChatbox({ launcherIcon: maliciousSvg });

  assert.ok(!bot.launcher.innerHTML.includes("<script"), "Malicious script tags must be stripped");
  assert.ok(bot.launcher.innerHTML.includes("<circle"), "Safe SVG elements must be preserved");

  bot.destroy();
});

test("Lifecycle - destroy() removes both container and launcher from DOM", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const bot = new AkvoRagChatbox({ title: "IDC Assistant" });

  assert.ok(bot.container, "Container should exist before destroy");
  assert.ok(bot.launcher, "Launcher should exist before destroy");

  bot.destroy();

  assert.strictEqual(bot.container, null, "Container reference cleared");
  assert.strictEqual(bot.launcher, null, "Launcher reference cleared");
});

test("Methods - open, close, and minimize programmatically control state", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const bot = new AkvoRagChatbox({ startMinimized: false });

  // Initially open
  assert.strictEqual(bot.isMinimized, false);
  assert.strictEqual(bot.container.style.display, "flex");
  assert.strictEqual(bot.launcher.style.display, "none");

  // Call close()
  bot.close();
  assert.strictEqual(bot.isMinimized, true);
  assert.strictEqual(bot.container.style.display, "none");
  assert.strictEqual(bot.launcher.style.display, "flex");

  // Call open()
  bot.open();
  assert.strictEqual(bot.isMinimized, false);
  assert.strictEqual(bot.container.style.display, "flex");
  assert.strictEqual(bot.launcher.style.display, "none");

  // Call minimize() (alias for close)
  bot.minimize();
  assert.strictEqual(bot.isMinimized, true);
  assert.strictEqual(bot.container.style.display, "none");
  assert.strictEqual(bot.launcher.style.display, "flex");

  bot.destroy();
});

test("Re-init - Handles pre-existing container in DOM gracefully", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const bot1 = new AkvoRagChatbox({ startMinimized: false });

  // Now bot1's container exists in DOM; creating bot2 should find and re-use state
  const bot2 = new AkvoRagChatbox({ startMinimized: true });
  assert.strictEqual(bot2.isMinimized, true);

  bot1.destroy();
  bot2.destroy();
});

test("Legacy Mode - showLauncher: false does not mount launcher button", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const bot = new AkvoRagChatbox({ showLauncher: false, title: "Classic Bot" });

  assert.strictEqual(bot.launcher, null, "Launcher button should not be created");
  assert.ok(bot.container, "Chatbox container should exist");
  assert.strictEqual(bot.container.style.display, "flex", "Chatbox should be visible by default");
  assert.strictEqual(bot.isMinimized, false, "Initial state should not be minimized");

  // 1. Clicking close button minimizes container in legacy mode
  const closeBtn = bot.container.querySelector("#akvo-rag-close-btn");
  const header = bot.container.querySelector("#akvo-rag-header");
  assert.ok(closeBtn, "Close button must exist");
  assert.ok(header, "Header must exist");

  closeBtn.click();
  assert.ok(
    bot.container.classList.contains("minimized"),
    "Container should have minimized class in legacy mode"
  );
  assert.strictEqual(bot.isMinimized, true, "State should be minimized");

  // 2. Clicking close button again toggles/expands container
  closeBtn.click();
  assert.strictEqual(
    bot.container.classList.contains("minimized"),
    false,
    "Container should no longer have minimized class after toggle"
  );
  assert.strictEqual(bot.isMinimized, false, "State should not be minimized");

  // 3. Minimize again, then clicking header expands container
  closeBtn.click();
  assert.ok(bot.container.classList.contains("minimized"), "Minimized again");
  assert.strictEqual(bot.isMinimized, true);

  header.click();
  assert.strictEqual(
    bot.container.classList.contains("minimized"),
    false,
    "Clicking header when minimized expands container"
  );
  assert.strictEqual(bot.isMinimized, false);

  // 4. Programmatic minimize and open
  bot.minimize();
  assert.ok(bot.container.classList.contains("minimized"), "Programmatic minimize sets class");
  assert.strictEqual(bot.isMinimized, true);

  bot.open();
  assert.strictEqual(bot.container.classList.contains("minimized"), false, "Programmatic open clears class");
  assert.strictEqual(bot.isMinimized, false);

  bot.destroy();
  assert.strictEqual(bot.container, null, "Container cleared on destroy");
  assert.strictEqual(bot.launcher, null, "Launcher remains null on destroy");
});

test("Legacy Mode - startMinimized: true mounts with minimized class", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const bot = new AkvoRagChatbox({ showLauncher: false, startMinimized: true });

  assert.strictEqual(bot.launcher, null);
  assert.ok(bot.container);
  assert.ok(
    bot.container.classList.contains("minimized"),
    "Legacy mode with startMinimized: true mounts with minimized class"
  );
  assert.strictEqual(bot.isMinimized, true);

  // Expanding via open
  bot.open();
  assert.strictEqual(bot.container.classList.contains("minimized"), false);
  assert.strictEqual(bot.isMinimized, false);

  bot.destroy();
});

test("Theming - Validates primaryColor format safely", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");

  // Valid Hex
  const botValid = new AkvoRagChatbox({ primaryColor: "#007A78" });
  assert.strictEqual(
    botValid.container.style.getPropertyValue("--akvo-primary"),
    "#007A78"
  );
  botValid.destroy();

  // Invalid / Dangerous string should be ignored
  const botInvalid = new AkvoRagChatbox({
    primaryColor: "red; background: url('evil.com')",
  });
  assert.strictEqual(
    botInvalid.container.style.getPropertyValue("--akvo-primary"),
    "",
    "Malicious primaryColor must not be applied"
  );
  botInvalid.destroy();
});

test("UI Sizing - Width and Height applied via custom properties and style", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");

  // 1. Numeric values
  const botNumeric = new AkvoRagChatbox({ width: 420, height: 580 });
  assert.strictEqual(
    botNumeric.container.style.getPropertyValue("--akvo-width"),
    "420px"
  );
  assert.strictEqual(
    botNumeric.container.style.getPropertyValue("--akvo-height"),
    "580px"
  );
  botNumeric.destroy();

  // 2. Unit strings
  const botString = new AkvoRagChatbox({ width: "25rem", height: "80vh" });
  assert.strictEqual(
    botString.container.style.getPropertyValue("--akvo-width"),
    "25rem"
  );
  assert.strictEqual(
    botString.container.style.getPropertyValue("--akvo-height"),
    "80vh"
  );
  botString.destroy();

  // 3. Malicious injection strings rejected
  const botMalicious = new AkvoRagChatbox({
    width: "400px; evil: true;",
    height: "calc(100vh + evil)",
  });
  assert.strictEqual(
    botMalicious.container.style.getPropertyValue("--akvo-width"),
    ""
  );
  assert.strictEqual(
    botMalicious.container.style.getPropertyValue("--akvo-height"),
    ""
  );
  botMalicious.destroy();
});

test("UI Styling - Border Radius and Z-Index applied safely", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");

  const bot = new AkvoRagChatbox({
    borderRadius: 16,
    zIndex: 100000,
  });

  assert.strictEqual(
    bot.container.style.getPropertyValue("--akvo-border-radius"),
    "16px"
  );
  assert.strictEqual(
    bot.container.style.getPropertyValue("--akvo-z-index"),
    "100000"
  );
  assert.strictEqual(
    bot.launcher.style.getPropertyValue("--akvo-z-index"),
    "99999",
    "Launcher z-index should be zIndex - 1"
  );

  bot.destroy();
});

test("UI Positioning - Position bottom-left toggles akvo-position-left class", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");

  // Bottom Left
  const botLeft = new AkvoRagChatbox({ position: "bottom-left" });
  assert.ok(
    botLeft.container.classList.contains("akvo-position-left"),
    "Container should have akvo-position-left class"
  );
  assert.ok(
    botLeft.launcher.classList.contains("akvo-position-left"),
    "Launcher should have akvo-position-left class"
  );
  botLeft.destroy();

  // Default Bottom Right (no akvo-position-left class)
  const botRight = new AkvoRagChatbox({ position: "bottom-right" });
  assert.strictEqual(
    botRight.container.classList.contains("akvo-position-left"),
    false
  );
  assert.strictEqual(
    botRight.launcher.classList.contains("akvo-position-left"),
    false
  );
  botRight.destroy();
});

test("UI Sizing - Launcher size and dimensions applied via custom properties", async () => {
  setupMockDOM();
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");

  // 1. Numeric launcherSize (circular)
  const botSize = new AkvoRagChatbox({ launcherSize: 64 });
  assert.strictEqual(
    botSize.launcher.style.getPropertyValue("--akvo-launcher-width"),
    "64px"
  );
  assert.strictEqual(
    botSize.launcher.style.getPropertyValue("--akvo-launcher-height"),
    "64px"
  );
  botSize.destroy();

  // 2. Separate launcherWidth and launcherHeight
  const botCustom = new AkvoRagChatbox({
    launcherWidth: "72px",
    launcherHeight: "48px",
  });
  assert.strictEqual(
    botCustom.launcher.style.getPropertyValue("--akvo-launcher-width"),
    "72px"
  );
  assert.strictEqual(
    botCustom.launcher.style.getPropertyValue("--akvo-launcher-height"),
    "48px"
  );
  botCustom.destroy();
});
