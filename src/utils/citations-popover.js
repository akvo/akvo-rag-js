export function replaceCitations(el, citations) {
  if (!el || !citations?.length) return;

  // Ensure this runs after the element is fully rendered
  requestAnimationFrame(() => {
    let html = el.innerHTML;

    citations.forEach((c) => {
      const citationId = c.id;

      // Flexible regex to match [ citation:ID ] with optional spaces
      const regex = new RegExp(
        `\\[\\s*citation:\\s*${citationId}\\s*\\]`,
        "gi"
      );

      const shortText =
        c.text.replace(/\s+/g, " ").trim().slice(0, 200) + "...";
      const source = c.metadata.source || "Unknown Source";
      const page = c.metadata.page_label || c.metadata.page || "n/a";
      const title =
        c.metadata.title || c.metadata.source || "Untitled Document";

      // Escape quotes for use in HTML attributes
      const safeText = shortText.replace(/"/g, "&quot;");
      const safeSource = source.replace(/"/g, "&quot;");
      const safeTitle = title.replace(/"/g, "&quot;");

      const popoverHTML = `
        <sup
          class="citation"
          data-id="${citationId}"
          data-text="${safeText}"
          data-source="${safeSource}"
          data-page="${page}"
          data-title="${safeTitle}"
        >[${citationId}]</sup>`;

      html = html.replace(regex, popoverHTML);
    });

    el.innerHTML = html;

    // Attach event listeners
    const citationNodes = el.querySelectorAll(".citation");
    citationNodes.forEach((node) => {
      node.style.cursor = "pointer";
      node.addEventListener("mouseenter", showPopover);
      node.addEventListener("mouseleave", hidePopover);
    });
  });
}

function showPopover(event) {
  // Remove existing popovers
  document.querySelectorAll(".citation-popover").forEach((el) => el.remove());

  const node = event.target;

  const popover = document.createElement("div");
  popover.className = "citation-popover";
  popover.innerHTML = `
    <div class="arrow"></div>
    <div><strong>${node.dataset.title}</strong></div>
    <div><small>Source: ${node.dataset.source}, Page: ${node.dataset.page}</small></div>
    <p>${node.dataset.text}</p>
  `;
  document.body.appendChild(popover);

  const popoverWidth = popover.offsetWidth;
  const popoverHeight = popover.offsetHeight;

  const rect = node.getBoundingClientRect();
  const arrowSize = 8;
  const margin = 10;

  let left = rect.left + window.scrollX - popoverWidth / 2 + rect.width / 2;
  const maxLeft = window.scrollX + window.innerWidth - popoverWidth - margin;
  const minLeft = window.scrollX + margin;

  left = Math.max(Math.min(left, maxLeft), minLeft);

  const spaceAbove = rect.top;
  const spaceBelow = window.innerHeight - rect.bottom;
  const showAbove = spaceBelow < popoverHeight + arrowSize + margin;

  const top = showAbove
    ? rect.top + window.scrollY - popoverHeight - arrowSize - 2
    : rect.bottom + window.scrollY + arrowSize + 2;

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
  popover.dataset.target = node.dataset.id;

  popover.classList.toggle("above", showAbove);
  popover.classList.toggle("below", !showAbove);

  const arrow = popover.querySelector(".arrow");
  const citationCenterX = rect.left + rect.width / 2 + window.scrollX;
  let arrowLeft = citationCenterX - left - arrowSize;

  arrowLeft = Math.max(
    arrowSize,
    Math.min(arrowLeft, popoverWidth - arrowSize * 2)
  );
  arrow.style.left = `${arrowLeft}px`;
}

function hidePopover(event) {
  const node = event.target;
  const popovers = document.querySelectorAll(".citation-popover");
  popovers.forEach((el) => {
    if (el.dataset.target === node.dataset.id) {
      el.remove();
    }
  });
}
