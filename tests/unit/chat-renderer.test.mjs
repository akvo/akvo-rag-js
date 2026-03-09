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

// Comprehensive edge cases from implementation plan
test("accumulateAssistantText - Newlines in quoted chunks", () => {
  let text = "";
  text = accumulateAssistantText('0:"Line 1\\nLine 2"', text);
  assert.strictEqual(
    text,
    "Line 1\nLine 2",
    "Should correctly parse newlines in technical quotes",
  );
});

test("accumulateAssistantText - Trailing whitespace in technical segment", () => {
  let text = "";
  // The specific bug reported: 0: "word"  (with trailing space)
  text = accumulateAssistantText('0:"living" ', text);
  assert.strictEqual(
    text,
    "living",
    "Should strip quotes even with trailing whitespace",
  );

  text = accumulateAssistantText('0:" income" ', text);
  assert.strictEqual(
    text,
    "living income",
    "Should ignore trailing whitespace in envelope",
  );
});

test("accumulateAssistantText - Fragmented quotes with newlines", () => {
  let text = "";
  text = accumulateAssistantText('0:"Line 1\n', text);
  assert.strictEqual(
    text,
    "Line 1\n",
    "Should handle starting quote with newline",
  );
  text = accumulateAssistantText('Line 2"', text); // No prefix case
  assert.strictEqual(
    text,
    "Line 1\nLine 2",
    "Should handle fragmented ending quote",
  );
});

test("accumulateAssistantText - Emojis", () => {
  let text = "";
  text = accumulateAssistantText('0:"Hello 🌍"', text);
  assert.strictEqual(text, "Hello 🌍", "Should handle emojis correctly");
});

test("accumulateAssistantText - Empty quoted chunks", () => {
  let text = "Previous";
  text = accumulateAssistantText('0:""', text);
  assert.strictEqual(text, "Previous", "Should handle empty technical quotes");
});

test("accumulateAssistantText - Large integer prefixes", () => {
  let text = "";
  text = accumulateAssistantText('1234:"Long prefix"', text);
  assert.strictEqual(
    text,
    "Long prefix",
    "Should handle large numerical prefixes",
  );
});

test("accumulateAssistantText - Regression: Quoted response pattern", () => {
  let text = "";
  // Simulate the exact pattern reported by user: A" living" income"
  text = accumulateAssistantText('0:"A" ', text);
  text = accumulateAssistantText('0:" living" ', text);
  text = accumulateAssistantText('0:" income" ', text);

  assert.strictEqual(
    text,
    "A living income",
    "Should correctly strip quotes when multiple fragments have trailing space",
  );
});
