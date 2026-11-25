import { test } from "node:test";
import assert from "node:assert";
import { replaceCitations } from "../../src/utils/citations-popover.js";

test("Citation Display Toggle - showCitations: true renders citations and badges", () => {
  let currentHTML = "According to the report [citation:1] water is life.";
  const el = {
    get innerHTML() {
      return currentHTML;
    },
    set innerHTML(val) {
      currentHTML = val;
    },
    querySelectorAll: () => [],
  };

  const citations = [
    {
      id: 1,
      text: "Water research document",
      metadata: { source: "Report 2024", title: "Water Study" },
    },
  ];

  globalThis.requestAnimationFrame = (fn) => fn();

  replaceCitations(el, citations, true);

  const normalizedHTML = el.innerHTML.replace(/\s+/g, " ");
  assert.ok(
    normalizedHTML.includes('<sup class="citation" data-id="1"'),
    "Should render citation badge when showCitations is true",
  );
  assert.ok(
    !el.innerHTML.includes("[citation:1]"),
    "Original [citation:1] token should be replaced",
  );
});

test("Citation Display Toggle - showCitations: false cleanly strips all citation tokens without superscripts", () => {
  let currentHTML = "Living income [citation:1] benchmark data [citation:2] was gathered.";
  const el = {
    get innerHTML() {
      return currentHTML;
    },
    set innerHTML(val) {
      currentHTML = val;
    },
    querySelectorAll: () => [],
  };

  const citations = [
    {
      id: 1,
      text: "Living Income Study",
      metadata: { source: "Living Income Report" },
    },
    {
      id: 2,
      text: "Benchmark Study",
      metadata: { source: "Benchmark Report" },
    },
  ];

  globalThis.requestAnimationFrame = (fn) => fn();

  replaceCitations(el, citations, false);

  assert.ok(
    !el.innerHTML.includes('<sup class="citation"'),
    "Should NOT render any sup.citation elements when showCitations is false",
  );
  assert.ok(
    !el.innerHTML.includes("[citation:1]"),
    "Should strip [citation:1] token",
  );
  assert.ok(
    !el.innerHTML.includes("[citation:2]"),
    "Should strip [citation:2] token",
  );
  assert.strictEqual(
    el.innerHTML.trim(),
    "Living income  benchmark data  was gathered.",
    "Should preserve text around stripped citations",
  );
});
