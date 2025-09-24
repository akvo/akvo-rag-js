export function cleanStreamingText(rawText) {
  let text = rawText;

  // 1. Join letters or numbers separated by spaces (e.g., "A G R A" -> "AGRA")
  //    but ignore anything inside markdown markers (** __ `)
  text = text.replace(
    /\b(?:[A-Za-z0-9](?: ?[A-Za-z0-9])){2,10}\b/g,
    (match) => {
      // If the match contains markdown markers, leave it untouched
      if (/[*_`]/.test(match)) return match;

      const noSpace = match.replace(/ /g, "");
      return noSpace.length <= 10 ? noSpace : match;
    }
  );

  // 2. Remove spaces before punctuation marks like , . : ; !
  text = text.replace(/\s+([,.:;!?])/g, "$1");

  // 2b. Remove spaces immediately inside bold/italic markers (** text ** -> **text**)
  text = text.replace(/(\*\*|__)\s*(.*?)\s*(\*\*|__)/g, "$1$2$3");

  // 2c. Remove spaces inside inline code markers (` code ` -> `code`)
  text = text.replace(/` +([^`]+?) +`/g, "`$1`");

  // 3. Fix markdown code blocks by removing spaces after ```
  text = text.replace(/``` *bash/g, "```bash");

  // 4. Merge lines that end with backslash \ with the next line (remove \ + newline)
  text = text.replace(/\\\n\s*/g, "");

  // 5. Replace 3 or more newlines with a maximum of 2 newlines
  text = text.replace(/\n{3,}/g, "\n\n");

  // 6. Replace multiple spaces or tabs with a single space
  text = text.replace(/[ \t]{2,}/g, " ");

  // 7. Trim spaces at the start and end of each line
  text = text
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  // 8. Join lines that are broken mid-sentence (if previous line doesn't end with punctuation)
  const paragraphs = [];
  let buffer = "";

  text.split("\n").forEach((line) => {
    if (line === "") {
      if (buffer) {
        paragraphs.push(buffer.trim());
        buffer = "";
      }
    } else {
      if (buffer) {
        if (!/[.!?]$/.test(buffer)) {
          buffer += " " + line;
        } else {
          paragraphs.push(buffer.trim());
          buffer = line;
        }
      } else {
        buffer = line;
      }
    }
  });

  if (buffer) paragraphs.push(buffer.trim());

  return paragraphs.join("\n\n");
}
