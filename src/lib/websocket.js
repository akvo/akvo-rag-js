import { cleanBase64 } from "../utils/base64.js";

export function connectWebSocket(options, onMessage) {
  const socket = new WebSocket(options.wsURL);

  socket.onopen = () => {
    console.log("[WebSocket] Connected");
    socket.send(
      JSON.stringify({
        type: "auth",
        token: options.token,
        kb_id: options.kb_id,
      })
    );
  };

  socket.onmessage = (event) => {
    let data = null;
    try {
      data = JSON.parse(event.data);
    } catch {
      console.warn("[WebSocket] Received non-JSON data", event.data);
      return;
    }

    if (onMessage) {
      if (
        data.type === "response_chunk" &&
        data.content.includes("__LLM_RESPONSE__")
      ) {
        try {
          const [base64Part, responseText] =
            data.content.split("__LLM_RESPONSE__");

          const base64Clean = cleanBase64(base64Part);

          let contextData = null;
          if (base64Clean) {
            try {
              const decoded = atob(base64Clean);
              contextData = JSON.parse(decoded);
            } catch (e) {
              console.warn("Failed to decode or parse base64 contextData", e);
            }
          }

          const citations =
            contextData?.context?.map((citation, index) => ({
              id: index + 1,
              text: citation.page_content,
              metadata: citation.metadata,
            })) || [];

          onMessage({
            ...data,
            content: responseText.trim(),
            citations,
          });
        } catch (e) {
          console.error("Failed to parse __LLM_RESPONSE__", e);
          onMessage(data);
        }
      } else {
        onMessage(data);
      }
    }
  };

  socket.onclose = () => {
    console.log("[WebSocket] Connection closed");
  };

  socket.onerror = (error) => {
    console.error("[WebSocket] Error:", error);
  };

  return socket;
}
