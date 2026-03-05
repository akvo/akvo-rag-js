import test from "node:test";
import assert from "node:assert";
import { marked } from "marked";

// Simulate the configuration in chat-renderer.js
marked.setOptions({
  gfm: true,
  breaks: true,
});

test("Markdown Rendering - GFM and Breaks", async (t) => {
  await t.test("renders headers correctly", () => {
    const html = marked.parse("# Hello");
    assert.match(html, /<h1>Hello<\/h1>/);
  });

  await t.test("renders GFM tables", () => {
    const table = `
| A | B |
|---|---|
| 1 | 2 |
`;
    const html = marked.parse(table);
    assert.match(html, /<table>/);
    assert.match(html, /<td>1<\/td>/);
  });

  await t.test("preserves line breaks", () => {
    const text = "Line 1\nLine 2";
    const html = marked.parse(text);
    assert.match(html, /Line 1<br>Line 2/);
  });

  await t.test("renders links correctly", () => {
    const html = marked.parse("[Google](https://google.com)");
    assert.match(html, /<a href="https:\/\/google.com">Google<\/a>/);
  });
});
