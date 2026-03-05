import test from "node:test";
import assert from "node:assert";
import { cleanStreamingText } from "../../src/utils/text-cleaner.js";

test("cleanStreamingText - Spacing and Word Joining", async (t) => {
  await t.test("joins letters separated by spaces", () => {
    assert.strictEqual(
      cleanStreamingText("A G R A is a city"),
      "AGRA is a city",
    );
    assert.strictEqual(
      cleanStreamingText("a l l e v i a t i o n"),
      "alleviation",
    );
  });

  await t.test("does not join separate words", () => {
    assert.strictEqual(cleanStreamingText("is a"), "is a");
    assert.strictEqual(cleanStreamingText("living income"), "living income");
  });

  await t.test("removes spaces before punctuation", () => {
    assert.strictEqual(cleanStreamingText("Hello , world !"), "Hello, world!");
  });

  await t.test("cleans spaces inside markdown markers", () => {
    assert.strictEqual(
      cleanStreamingText("This is ** bold ** text"),
      "This is **bold** text",
    );
    assert.strictEqual(
      cleanStreamingText("Use ` code ` here"),
      "Use `code` here",
    );
  });

  await t.test("merges multiple spaces into one", () => {
    assert.strictEqual(
      cleanStreamingText("Too   much    spacing"),
      "Too much spacing",
    );
  });
});
