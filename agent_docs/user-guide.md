# User Guide: Akvo RAG JS

Welcome to the Akvo RAG JS widget. This guide provides detailed information on how to integrate and manage the widget in your web applications.

## 🚀 Getting Started

### Installation
You can include the widget via NPM or directly via CDN.

```bash
npm install akvo-rag-js
```

### Basic Initialization
To start the chat, use the `initChat` function. This now returns an instance of `AkvoRagChatbox`.

```javascript
import { initChat } from 'akvo-rag-js';

const chat = initChat({
  title: 'Akvo Support',
  kb_id: 123,
  wsURL: 'wss://your-backend.com/ws/chat'
});
```

## 🏗️ Advanced API: `AkvoRagChatbox`

Since version 1.2.x, the widget uses an instance-based pattern. This allows for better control over the widget's lifecycle.

### Lifecycle Management
The widget can be cleanly removed from the DOM and all resources released using the `destroy()` method.

```javascript
// Remove the widget and close connections
chat.destroy();
```

### Multiple Instances
You can technically initialize multiple instances if needed, as state is isolated within the class instance. However, ensure they don't share the same DOM ID if you customize the root element.

## 🛡️ Resilience & Reliability

### Exponential Backoff
The widget automatically handles disconnections using an **Exponential Backoff** strategy with **Jitter**.
- Reconnection attempts double in delay (1s, 2s, 4s...) up to a maximum of 30 seconds.
- Random jitter (+/- 500ms) is added to each attempt to prevent synchronized requests ("thundering herd" effect) that could further strain the backend.

### Robust Streaming
The widget uses optimized rendering with change-detection. It will only update the DOM if the AI response content has meaningfully changed between streaming chunks, ensuring a smooth experience even on lower-end devices.

## 🎨 Customization

### Theming
The widget uses scoped SCSS. You can customize colors and typography by overriding the CSS variables at the root level of your host application's stylesheet, or by providing custom SCSS variables before building from source.

### Knowledge Base Options
If you don't provide a `kb_id`, you can provide a list of `kb_options`. The user will be prompted to select a Knowledge Base before they can start chatting.

```javascript
initChat({
  title: 'Support Hub',
  kb_options: [
    { kb_id: 1, label: 'Documentation' },
    { kb_id: 2, label: 'Technical Support' }
  ],
  wsURL: 'wss://...'
});
```

## 🧪 Support & Contribution
If you encounter any issues, please check the [Architecture Documentation](./architecture.md) or refer to the [Research Findings](./research-findings.md) for known limitations and planned improvements.
