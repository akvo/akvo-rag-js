import { test } from "node:test";
import assert from "node:assert";

// Mocking environment for Node.js
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
};

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, "crypto", {
    value: { randomUUID: () => "1234-5678" },
    configurable: true,
  });
} else if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = () => "1234-5678";
}

globalThis.document = {
  getElementById: () => null,
  createElement: (tag) => ({
    addEventListener: () => {},
    removeEventListener: () => {},
    innerHTML: "",
    setAttribute: () => {},
    style: {
      setProperty: () => {},
      display: "",
    },
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

test("WebSocket - supports both wsURL and wsUrl options", async () => {
  const { connectWebSocket } = await import("../../src/lib/websocket.js");

  let connectedUrl = null;
  const originalWs = globalThis.WebSocket;
  globalThis.WebSocket = class MockWS {
    static OPEN = 1;
    constructor(url) {
      connectedUrl = url;
      this.readyState = MockWS.OPEN;
    }
    send() {}
    close() {}
  };

  try {
    // 1. wsURL (uppercase)
    const conn1 = connectWebSocket({ wsURL: "wss://akvo-rag.akvotest.org/ws/chat" });
    assert.strictEqual(connectedUrl, "wss://akvo-rag.akvotest.org/ws/chat");
    conn1.close();

    // 2. wsUrl (camelCase)
    const conn2 = connectWebSocket({ wsUrl: "ws://localhost:81/ws/chat" });
    assert.strictEqual(connectedUrl, "ws://localhost:81/ws/chat");
    conn2.close();

    // 3. No URL passed
    connectedUrl = null;
    const conn3 = connectWebSocket({});
    assert.strictEqual(connectedUrl, null);
    assert.strictEqual(conn3.socket, null);
    assert.doesNotThrow(() => conn3.close());
  } finally {
    globalThis.WebSocket = originalWs;
  }
});
