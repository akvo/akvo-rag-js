import { test } from "node:test";
import assert from "node:assert";
import { accumulateAssistantText } from "../../src/utils/chat-renderer.js";

test("accumulateAssistantText - Basic concatenation", () => {
  let text = "";
  text = accumulateAssistantText('0:"Hello"', text);
  assert.strictEqual(text, "Hello");
  text = accumulateAssistantText('0:" world"', text);
  assert.strictEqual(text, "Hello world");
});

test("accumulateAssistantText - Leading quote bug reproduction & fix", () => {
  let text = "";
  // Simulate common but problematic chunking
  text = accumulateAssistantText('0:"', text);
  assert.strictEqual(text, "", "Should strip leading technical quote");

  text = accumulateAssistantText('0:"A living income"', text);
  assert.strictEqual(text, "A living income", "Should not have leading quote");
});

test("accumulateAssistantText - Technical prefix with space", () => {
  let text = "";
  text = accumulateAssistantText('0: "Hi"', text);
  assert.strictEqual(text, "Hi", "Should handle space after colon");
});

test("accumulateAssistantText - Escaped quotes", () => {
  let text = "";
  text = accumulateAssistantText('0:"He said \\"Hello\\""', text);
  assert.strictEqual(text, 'He said "Hello"', "Should decode escaped quotes");
});

test("accumulateAssistantText - Metadata chunks", () => {
  let text = "Previous content";
  const result = accumulateAssistantText('d:{"finishReason":"stop"}', text);
  assert.strictEqual(result, text, "Should ignore metadata chunks");
});

test("accumulateAssistantText - Direct text (no prefix)", () => {
  let text = "";
  text = accumulateAssistantText("Raw text", text);
  assert.strictEqual(
    text,
    "Raw text",
    "Should handle non-json chunks gracefully",
  );
});
