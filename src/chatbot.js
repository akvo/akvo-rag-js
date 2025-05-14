export function initChat(options = {}) {
	let container = document.getElementById("akvo-rag");

	if (!container) {
		container = document.createElement("div");
		container.id = "akvo-rag";

		// Full UI
		container.innerHTML = `
      <div id="akvo-rag-header">
        ${options.botName || "Chatbot"}
        <button id="akvo-rag-close-btn" class="akvo-rag-close-btn">
          <i class="fa fa-window-minimize" aria-hidden="true"></i>
        </button>
      </div>
      <div id="akvo-rag-body" class="akvo-rag-body">
        <p>Hello! How can I help you today?</p>
      </div>
    `;

		const header = container.querySelector("#akvo-rag-header");
		const body = container.querySelector("#akvo-rag-body");
		const btn = container.querySelector("#akvo-rag-close-btn");

		// Toggle minimize on close button click
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			container.classList.toggle("minimized");
		});

		// Expand when clicking minimized header
		header.addEventListener("click", () => {
			if (container.classList.contains("minimized")) {
				container.classList.remove("minimized");
			}
		});

		document.body.appendChild(container);
	} else {
		// If already exists, just expand
		container.classList.remove("minimized");
		const btn = container.querySelector("#akvo-rag-close-btn");
		btn.innerHTML = `<i class="fa fa-window-minimize" aria-hidden="true"></i>`;
	}
}
