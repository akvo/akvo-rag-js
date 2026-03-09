import { test } from "node:test";
import assert from "node:assert";

// Mocking environment for Node.js
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
};

globalThis.crypto = {
  randomUUID: () => "1234-5678",
};

globalThis.document = {
  getElementById: () => null,
  createElement: (tag) => ({
    id: "",
    innerHTML: "",
    appendChild: () => {},
    querySelector: () => ({
      addEventListener: () => {},
      remove: () => {},
      classList: { toggle: () => {}, remove: () => {}, contains: () => false },
    }),
    querySelectorAll: () => [],
    classList: { toggle: () => {}, remove: () => {}, contains: () => false },
    remove: () => {},
  }),
  body: {
    appendChild: () => {},
  },
};

globalThis.WebSocket = class {
  static OPEN = 1;
  constructor() {
    this.readyState = WebSocket.OPEN;
    setTimeout(() => this.onopen?.(), 10);
  }
  send() {}
  close() {}
};

test("Chatbot Class Pattern - Instance isolation", async (t) => {
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  const bot1 = new AkvoRagChatbox({ title: "Bot 1" });
  const bot2 = new AkvoRagChatbox({ title: "Bot 2" });

  assert.notStrictEqual(bot1, bot2, "Instances should be unique");
  assert.strictEqual(bot1.options.title, "Bot 1");
  assert.strictEqual(bot2.options.title, "Bot 2");
});

test("Chatbot Class Pattern - Destroy cleanup", async (t) => {
  const { AkvoRagChatbox } = await import("../../src/chatbot.js");
  let closed = false;
  const bot = new AkvoRagChatbox({ title: "Bot 1" });

  // Inject mock connection
  bot.wsConnection = {
    close: () => {
      closed = true;
    },
  };

  bot.destroy();
  assert.strictEqual(closed, true, "WebSocket should be closed on destroy");
  assert.strictEqual(
    bot.container,
    null,
    "Container reference should be cleared",
  );
});
