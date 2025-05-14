import "./scss/akvo-rag.scss";
import { initChat } from "./chatbot";

// For ESM/CJS usage
export { initChat };

// For global usage in browser
if (typeof window !== "undefined") {
	window.AkvoRAG = { init: initChat };
}
