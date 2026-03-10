import test from "node:test";
import assert from "node:assert";
import { replaceCitations } from "../../src/utils/citations-popover.js";

test("replaceCitations should handle large citation counts and missing data", async (t) => {
  // Mock element with getter/setter for innerHTML to simulate behavior
  let currentHTML =
    "The concept of a Living Income [citation:1] [citation:11] [citation:12] [citation:0] [citation:13] [citation:99] [citation:14]";
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
      text: "Living income text",
      metadata: { source: "Source 1", title: "Title 1" },
    },
    { id: 11, text: "Income 11", metadata: { source: "Source 11" } },
    { id: 12, text: "Income 12", metadata: {} },
    { id: 13, text: null, metadata: null }, // Incomplete
    { id: 14, text: "Income 14", metadata: { source: "Source 14" } },
  ];

  // Mock global objects
  global.requestAnimationFrame = (callback) => callback();

  console.log("Before replaceCitations:", el.innerHTML);
  replaceCitations(el, citations);
  console.log("After replaceCitations:", el.innerHTML);

  const html = el.innerHTML.replace(/\s+/g, " ");

  // Check if citations are replaced with superscripts (ignoring whitespace)
  assert.ok(
    html.includes('<sup class="citation" data-id="1"'),
    "Citation 1 should be rendered",
  );
  assert.ok(
    html.includes('<sup class="citation" data-id="11"'),
    "Citation 11 should be rendered",
  );
  assert.ok(
    html.includes('<sup class="citation" data-id="12"'),
    "Citation 12 should be rendered",
  );
  assert.ok(
    html.includes('<sup class="citation" data-id="13"'),
    "Citation 13 should be rendered",
  );
  assert.ok(
    html.includes('<sup class="citation" data-id="14"'),
    "Citation 14 should be rendered",
  );

  // Check that hallucinated citations are removed
  assert.ok(
    !html.includes("[citation:0]"),
    "Hallucinated Citation 0 should be stripped",
  );
  assert.ok(
    !html.includes("[citation:99]"),
    "Hallucinated Citation 99 should be stripped",
  );
});
