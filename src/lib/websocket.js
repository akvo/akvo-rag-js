import { cleanBase64 } from "../utils/base64.js";

export function connectWebSocket(options, onMessage, callbacks = {}) {
  let socket = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 10;
  const reconnectDelayMs = 3000; // 3 seconds

  // Helper to create the WebSocket and set handlers
  function createSocket() {
    socket = new WebSocket(options.wsURL);

    socket.onopen = () => {
      console.log("[WebSocket] Connected");
      reconnectAttempts = 0; // reset on successful connection
      socket.send(
        JSON.stringify({
          type: "auth",
          visitor_id: options.visitorId,
          kb_id: options.kb_id,
        })
      );
      if (options.onOpen) options.onOpen();
    };

    socket.onmessage = (event) => {
      let data = null;
      try {
        data = JSON.parse(event.data);
      } catch {
        console.warn("[WebSocket] Received non-JSON data", event.data);
        return;
      }

      if (!onMessage) return;

      if (data.type === "ping") {
        socket.send(JSON.stringify({ type: "pong" }));
        console.log("Pong sent to server");
        return;
      }

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
    };

    socket.onclose = (event) => {
      console.warn(
        `WebSocket closed: code=${event.code} reason=${event.reason}`
      );

      if (options.autoReconnect && event.code !== 1000) {
        // 1000 = normal close
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(
            `[WebSocket] Reconnect attempt ${reconnectAttempts} in ${reconnectDelayMs}ms`
          );
          if (callbacks?.onReconnect) {
            callbacks.onReconnect(reconnectAttempts);
          }
          setTimeout(() => {
            createSocket();
          }, reconnectDelayMs);
        } else {
          console.error("[WebSocket] Max reconnect attempts reached.");
          if (options.onMaxReconnect) options.onMaxReconnect();
        }
      }
    };

    socket.onerror = (event) => {
      console.error("WebSocket error:", event);
      if (options.onError) options.onError(event);
    };
  }

  createSocket();

  return {
    get socket() {
      return socket;
    },
    close() {
      options.autoReconnect = false; // stop auto reconnect on manual close
      socket.close(1000, "Client closed connection");
    },
  };
}
