export function replaceCitations(el, citations) {
  if (!el) return;

  let html = el.innerHTML;

  citations.forEach((c) => {
    const citationId = c.id;
    const escapedRegex = new RegExp(`\\[ citation: ${citationId} \\]`, "g");

    // Slice text to max 200 chars
    const shortText = c.text.replace(/\s+/g, " ").trim().slice(0, 200) + "...";

    // Metadata info
    const source = c.metadata.source || "Unknown Source";
    const page = c.metadata.page_label || c.metadata.page || "n/a";
    const title = c.metadata.title || c.metadata.source || "Untitled Document";

    const popoverHTML = `
      <sup
        class="citation"
        data-id="${citationId}"
        data-text="${shortText.replace(/"/g, "&quot;")}"
        data-source="${source}"
        data-page="${page}"
        data-title="${title}"
      >[${citationId}]</sup>`;

    html = html.replace(escapedRegex, popoverHTML);
  });

  el.innerHTML = html;

  const citationNodes = el.querySelectorAll(".citation");
  citationNodes.forEach((node) => {
    node.style.cursor = "pointer";
    node.addEventListener("mouseenter", showPopover);
    node.addEventListener("mouseleave", hidePopover);
  });
}

function showPopover(event) {
  // delete all popover
  document.querySelectorAll(".citation-popover").forEach((el) => el.remove());

  const node = event.target;

  // popover element
  const popover = document.createElement("div");
  popover.className = "citation-popover";
  popover.innerHTML = `
    <div class="arrow"></div>
    <div>
      <strong>${node.dataset.title}</strong>
    </div>
    <div>
      <small>Source: ${node.dataset.source}, Page: ${node.dataset.page}</small>
    </div>
    <p>${node.dataset.text}</p>
  `;
  document.body.appendChild(popover);

  // popover size
  const popoverWidth = popover.offsetWidth;
  const popoverHeight = popover.offsetHeight;

  const rect = node.getBoundingClientRect();
  const arrowSize = 8;
  const margin = 10;

  // horizontal position viewport
  let left = rect.left + window.scrollX - popoverWidth / 2 + rect.width / 2;

  // right: viewport + scroll
  const maxLeft = window.scrollX + window.innerWidth - popoverWidth - margin;
  if (left > maxLeft) {
    left = maxLeft;
  }
  // left: viewport + scroll
  const minLeft = window.scrollX + margin;
  if (left < minLeft) {
    left = minLeft;
  }

  // vertical
  const spaceAbove = rect.top;
  const spaceBelow = window.innerHeight - rect.bottom;
  const showAbove = spaceBelow < popoverHeight + arrowSize + margin;

  const top = showAbove
    ? rect.top + window.scrollY - popoverHeight - arrowSize - 2
    : rect.bottom + window.scrollY + arrowSize + 2;

  // popover position
  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
  popover.dataset.target = node.dataset.id;

  // styling arrow direction
  popover.classList.toggle("above", showAbove);
  popover.classList.toggle("below", !showAbove);

  // arrow position (middle)
  const arrow = popover.querySelector(".arrow");
  const citationCenterX = rect.left + rect.width / 2 + window.scrollX;
  let arrowLeft = citationCenterX - left - arrowSize;

  if (arrowLeft < arrowSize) arrowLeft = arrowSize;
  if (arrowLeft > popoverWidth - arrowSize * 2)
    arrowLeft = popoverWidth - arrowSize * 2;

  arrow.style.left = `${arrowLeft}px`;
}

function hidePopover(event) {
  const node = event.target;
  const popovers = document.querySelectorAll(`.citation-popover`);
  popovers.forEach((el) => {
    if (el.dataset.target === node.dataset.id) {
      el.remove();
    }
  });
}
