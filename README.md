# Akvo RAG JS

An embeddable chatbot widget for Akvo RAG.

- **Premium Markdown Rendering**: Supports GitHub Flavored Markdown (GFM), tables, code blocks, and lists with isolated, premium styling.
- **Optimized Streaming UX**: Intelligent text cleaning to prevent mid-word spacing issues during real-time streaming.
- **Embeddable & Flexible**: Embed directly into HTML with `<script>` or use as an NPM module.
- **Knowledge Base Selection**: Supports multiple KB selections with a clear "Start Chat" workflow.
- **Isolated Styling**: Scoped CSS (`#akvo-rag`) using SCSS to prevent style collisions with host sites.
- **Resilient Reconnection**: Exponential backoff with jitter to protect backend during outages (ADR-005).
- **Component Lifecycle**: Class-based `AkvoRagChatbox` supporting multiple instances and clean `destroy()` (ADR-004).
- **Extensive Documentation**: Detailed ADRs, stories, and architecture docs available in `/agent_docs`.


---

## 📦 Installation

### Using NPM

```bash
npm install akvo-rag-js
```

Example Usage using `kb_id`:

```javascript
import { initChat } from 'akvo-rag-js';
import 'akvo-rag-js/dist/akvo-rag.css';

const chat = initChat({
  title: 'Support Bot',
  kb_id: 39,
  wsURL: "ws://localhost:81/ws/chat",
});

// Clean up when done
// chat.destroy();

```

Example Usage using `kb_options`:

```javascript
import { initChat } from 'akvo-rag-js';
import 'akvo-rag-js/dist/akvo-rag.css';

initChat({
  title: 'Support Bot',
  wsURL: "ws://localhost:81/ws/chat",
  kb_options: [
    { kb_id: 1, label: "General KB" },
    { kb_id: 2, label: "Technical KB" },
  ],
});
```

### Using CDN

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Chatbot Demo</title>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
  />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/akvo-rag-js@1.0.5/dist/akvo-rag.css" />
</head>
<body>

<script src="https://cdn.jsdelivr.net/npm/akvo-rag-js@1.0.5/dist/akvo-rag.js"></script>

<!-- USING kb_id -->
<script>
  AkvoRAG.initChat({
    title: 'Support Bot',
    kb_id: 39,
    wsURL: "ws://localhost:81/ws/chat",
  });
</script>

<!-- USING kb_options -->
<script>
  AkvoRAG.initChat({
    title: 'Support Bot',
    wsURL: "ws://localhost:81/ws/chat",
    kb_options: [
      { kb_id: 1, label: "General KB" },
      { kb_id: 2, label: "Technical KB" },
    ],
  });
</script>

</body>
</html>
```

## ⚙️ `initChat` Parameters

The `initChat` function accepts a configuration object to customize the chat widget behavior:

| Parameter    | Type                                      | Required | Description                                                   |
| ------------ | ----------------------------------------- | -------- | ------------------------------------------------------------- |
| `title`      | `string`                                  | ✅ Yes    | The title displayed at the top of the chat window.            |
| `kb_id`      | `number`                                  | ❌ No     | The initial Knowledge Base ID to use (if pre-selected).       |
| `wsURL`      | `string`                                  | ✅ Yes    | WebSocket endpoint URL for real-time chat communication.      |
| `kb_options` | `Array<{ kb_id: number, label: string }>` | ❌ No     | List of available KBs for the user to select before chatting. |
| `autoReconnect`| `boolean`                               | ❌ No     | Defaults to `true`. Uses exponential backoff (ADR-005).      |

### 🔧 Component Lifecycle (`AkvoRagChatbox`)

The `initChat` function returns an instance of `AkvoRagChatbox`. You can use it to manage the widget's lifecycle:

```javascript
const chat = initChat({ ... });

// To remove the widget and close connections:
chat.destroy();
```


💡 If kb_id is not provided, the chatbot will prompt the user to select a KB and then click “Start Chat” to begin the conversation.
💡 Additional configuration options may be added in future releases to support themes, positioning, or additional behaviors.


## 🚀 New “Start Chat” Flow
When kb_options are provided:

✅ The user must select a KB from the presented options.
✅ The “Start Chat” button (disabled initially) becomes enabled once a KB is selected.
✅ After clicking “Start Chat”, the chat input and Send button appear for messaging.

This makes it clearer to users that they need to pick a KB before chatting.



## 📚 Documentation Structure

We use the **BMAD (Business-Model-Architecture-Development)** methodology. All technical specifications and historical decisions are stored in the `/agent_docs` directory:

- **[PRD](file:///Users/galihpratama/Sites/akvo-rag-js/agent_docs/features/markdown-rendering-support.md)**: Product requirements for major features.
- **[Architecture](file:///Users/galihpratama/Sites/akvo-rag-js/agent_docs/architecture.md)**: High-level system design and data flows.
- **[ADRs](file:///Users/galihpratama/Sites/akvo-rag-js/agent_docs/adrs/)**: Architecture Decision Records (e.g., [ADR-003: Test Suite Architecture](file:///Users/galihpratama/Sites/akvo-rag-js/agent_docs/adrs/ADR-003-test-suite-architecture.md)).
- **[Stories](file:///Users/galihpratama/Sites/akvo-rag-js/agent_docs/stories/)**: User stories and implementation status.

## 🎨 Styling

We use **Scoped SCSS** to ensure the widget looks consistent regardless of the host website's styles:
- **Root Scope**: All styles are nested under `#akvo-rag`.
- **CSS Resets**: Isolated resets for markdown elements (headers, lists, tables) are located in `src/scss/_markdown.scss`.
- **Customization**: You can override the primary colors and typography by modifying the SCSS variables in `src/scss/akvo-rag.scss`.

## 🧱 Development


### Prerequisites
- Node.js (v18+)
- Webpack

### Local Setup
```bash
git clone https://github.com/akvo/akvo-rag-js.git
cd akvo-rag-js
npm install
npm run dev
```

### Modern ESM Stack
This project uses **Native ES Modules (ESM)**.
- All source files in `/src` use `export/import`.
- Internal imports **must** include the `.js` extension.
- Build tools (Webpack) use `.cjs` where CommonJS is required.

### Build
```bash
npm run build # Outputs optimized bundle to dist/
```

### Testing
We use the **Native Node.js Test Runner** (`node --test`) for maximum speed and zero dependencies.
```bash
npm test # Runs all tests in /tests
```



## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a PR.

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
