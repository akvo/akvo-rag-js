import { test, beforeEach } from "node:test";
import assert from "node:assert";

// In-memory Storage mock
class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

const mockSessionStorage = new MockStorage();
const mockLocalStorage = new MockStorage();

globalThis.sessionStorage = mockSessionStorage;
globalThis.localStorage = mockLocalStorage;

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, "crypto", {
    value: { randomUUID: () => "mock-visitor-id-1234" },
    configurable: true,
  });
} else if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = () => "mock-visitor-id-1234";
}

// Minimal DOM mock for Node environment
function createMockElement(tag, id = "", className = "") {
  const children = [];
  return {
    tagName: tag.toUpperCase(),
    id,
    className,
    innerHTML: "",
    textContent: "",
    value: "",
    style: {
      setProperty: () => {},
      display: "",
      height: "",
    },
    dataset: {},
    children,
    appendChild: (child) => {
      children.push(child);
      return child;
    },
    removeChild: (child) => {
      const idx = children.indexOf(child);
      if (idx > -1) children.splice(idx, 1);
    },
    remove: function () {
      // noop
    },
    querySelector: (selector) => {
      if (selector === "#akvo-rag-header") return createMockElement("div", "akvo-rag-header");
      if (selector === "#akvo-rag-close-btn") return createMockElement("button", "akvo-rag-close-btn");
      if (selector === "#akvo-rag-body") return createMockElement("div", "akvo-rag-body");
      if (selector === "#akvo-rag-input") return createMockElement("textarea", "akvo-rag-input");
      if (selector === "#akvo-rag-send-btn") return createMockElement("button", "akvo-rag-send-btn");
      if (selector === "#akvo-start-chat-btn") return createMockElement("button", "akvo-start-chat-btn");
      return null;
    },
    querySelectorAll: (selector) => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    setAttribute: () => {},
    getAttribute: () => null,
    classList: {
      toggle: () => {},
      remove: () => {},
      add: () => {},
      contains: () => false,
    },
  };
}

globalThis.document = {
  getElementById: (id) => null,
  createElement: (tag) => createMockElement(tag),
  body: createMockElement("body"),
  querySelector: () => null,
  querySelectorAll: () => [],
};

globalThis.requestAnimationFrame = (fn) => fn();

globalThis.WebSocket = class {
  static OPEN = 1;
  constructor() {
    this.readyState = WebSocket.OPEN;
  }
  send() {}
  close() {}
};

test("History Persistence - Options defaults and customization", async () => {
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");

  const botDefault = new AkvoRagChatbox({ kb_id: 101 });
  assert.strictEqual(botDefault.options.persistHistory, true, "persistHistory defaults to true");
  assert.strictEqual(botDefault.options.historyStorageType, "session", "historyStorageType defaults to session");
  assert.strictEqual(botDefault.options.historyStorageKey, "akvo_rag_history", "historyStorageKey defaults to akvo_rag_history");
  assert.strictEqual(botDefault.options.maxHistoryMessages, 20, "maxHistoryMessages defaults to 20");

  const botCustom = new AkvoRagChatbox({
    kb_id: 101,
    persistHistory: false,
    historyStorageType: "local",
    historyStorageKey: "custom_history",
    maxHistoryMessages: 5,
    userId: "alice",
  });
  assert.strictEqual(botCustom.options.persistHistory, false);
  assert.strictEqual(botCustom.options.historyStorageType, "local");
  assert.strictEqual(botCustom.options.historyStorageKey, "custom_history");
  assert.strictEqual(botCustom.options.maxHistoryMessages, 5);
  assert.strictEqual(botCustom.options.userId, "alice");
});

test("History Persistence - Multi-user isolation via composite storage key", async () => {
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");

  const botA = new AkvoRagChatbox({ kb_id: 101, userId: "alice_user" });
  const botB = new AkvoRagChatbox({ kb_id: 101, userId: "bob_user" });

  assert.notStrictEqual(
    botA._getHistoryStorageKey(),
    botB._getHistoryStorageKey(),
    "Storage keys must differ between different user IDs",
  );
  assert.ok(
    botA._getHistoryStorageKey().includes("alice_user"),
    "botA storage key must include alice_user",
  );
  assert.ok(
    botB._getHistoryStorageKey().includes("bob_user"),
    "botB storage key must include bob_user",
  );

  // Fallback to visitorId when userId is omitted
  const botAnon = new AkvoRagChatbox({ kb_id: 101 });
  assert.ok(
    botAnon._getHistoryStorageKey().includes(botAnon.visitorId),
    "Anonymous bot storage key must include visitorId",
  );
});

test("History Persistence - Disabling persistHistory disables all storage writes and reads", async () => {
  mockSessionStorage.clear();
  mockLocalStorage.clear();

  const { AkvoRagChatbox } = await import("../../src/chatbot.js");

  const bot = new AkvoRagChatbox({
    kb_id: 101,
    persistHistory: false,
    userId: "test_disabled_user",
  });

  bot.chatHistory.push({ role: "user", content: "Hello without persistence" });
  bot._saveHistoryToStorage();

  const key = bot._getHistoryStorageKey();
  assert.strictEqual(mockSessionStorage.getItem(key), null, "No item should be written to sessionStorage");
  assert.strictEqual(mockLocalStorage.getItem(key), null, "No item should be written to localStorage");
  assert.deepStrictEqual(bot._loadHistoryFromStorage(), [], "Should load empty history when disabled");
});

test("History Persistence - Saves and loads with sliding window limit", async () => {
  mockSessionStorage.clear();

  const { AkvoRagChatbox } = await import("../../src/chatbot.js");

  const bot = new AkvoRagChatbox({
    kb_id: 101,
    persistHistory: true,
    maxHistoryMessages: 3,
    userId: "window_user",
  });

  bot.chatHistory = [
    { role: "user", content: "msg 1" },
    { role: "assistant", content: "resp 1" },
    { role: "user", content: "msg 2" },
    { role: "assistant", content: "resp 2" },
  ];

  bot._saveHistoryToStorage();
  const loaded = bot._loadHistoryFromStorage();

  assert.strictEqual(loaded.length, 3, "Loaded messages should be limited to maxHistoryMessages (3)");
  assert.strictEqual(loaded[0].content, "resp 1");
  assert.strictEqual(loaded[1].content, "msg 2");
  assert.strictEqual(loaded[2].content, "resp 2");
});

test("History Persistence - clearHistory clears in-memory array and storage", async () => {
  mockSessionStorage.clear();

  const { AkvoRagChatbox } = await import("../../src/chatbot.js");

  const bot = new AkvoRagChatbox({
    kb_id: 101,
    persistHistory: true,
    userId: "clear_user",
  });

  bot.chatHistory = [{ role: "user", content: "Will be cleared" }];
  bot._saveHistoryToStorage();

  const key = bot._getHistoryStorageKey();
  assert.ok(mockSessionStorage.getItem(key) !== null, "Key should exist in storage before clear");

  bot.clearHistory();

  assert.deepStrictEqual(bot.getHistory(), [], "In-memory history should be empty");
  assert.strictEqual(mockSessionStorage.getItem(key), null, "Storage item should be deleted");
});

test("History Persistence - Rehydrates history into new chat instance", async () => {
  mockSessionStorage.clear();

  const { AkvoRagChatbox } = await import("../../src/chatbot.js");

  // Seed storage with existing conversation
  const testKey = "akvo_rag_history_rehydrate_user_202";
  const seedMessages = [
    { role: "user", content: "Previous question" },
    { role: "assistant", content: "Previous answer [citation:1]", citations: [{ id: 1, text: "Cite 1" }] },
  ];
  mockSessionStorage.setItem(testKey, JSON.stringify(seedMessages));

  const bot = new AkvoRagChatbox({
    kb_id: 202,
    userId: "rehydrate_user",
    persistHistory: true,
  });

  assert.strictEqual(bot.chatHistory.length, 2, "Should rehydrate 2 messages from storage");
  assert.strictEqual(bot.chatHistory[0].content, "Previous question");
  assert.strictEqual(bot.chatHistory[1].content, "Previous answer [citation:1]");
});

