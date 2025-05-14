export function initChat(options = {}) {
	let container = document.getElementById("akvo-rag-chatbot");

	if (!container) {
		container = document.createElement("div");
		container.id = "akvo-rag-chatbot";

		// Full UI
		container.innerHTML = `
      <div id="akvo-rag-chatbot-header">
        ${options.botName || "Chatbot"}
        <button id="akvo-rag-chatbot-close-btn" class="akvo-rag-chatbot-close-btn">
          <i class="fa fa-window-minimize" aria-hidden="true"></i>
        </button>
      </div>
      <div id="akvo-rag-chatbot-body" class="akvo-rag-chatbot-body">
        <p>Hello! How can I help you today?</p>
      </div>
    `;

		const header = container.querySelector("#akvo-rag-chatbot-header");
		const body = container.querySelector("#akvo-rag-chatbot-body");
		const btn = container.querySelector("#akvo-rag-chatbot-close-btn");

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
		const btn = container.querySelector("#akvo-rag-chatbot-close-btn");
		btn.innerHTML = `<i class="fa fa-window-minimize" aria-hidden="true"></i>`;
	}
}
