# Akvo RAG JS

An embeddable chatbot widget for Akvo RAG.

## 🎯 Features

- Embed directly into HTML with `<script>`
- Use as an NPM module with modern frameworks
- Minimize/restore functionality
- Supports multiple knowledge base (KB) selections before starting a conversation
- “Start Chat” button to clearly initiate the chat session
- Styled with SCSS using scoped ID selector (`#akvo-rag`)
- Font Awesome icons included
- Fully customizable via options

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

initChat({
  title: 'Support Bot',
  kb_id: 39,
  wsURL: "ws://localhost:81/ws/chat",
});
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

💡 If kb_id is not provided, the chatbot will prompt the user to select a KB and then click “Start Chat” to begin the conversation.
💡 Additional configuration options may be added in future releases to support themes, positioning, or additional behaviors.


## 🚀 New “Start Chat” Flow
When kb_options are provided:

✅ The user must select a KB from the presented options.
✅ The “Start Chat” button (disabled initially) becomes enabled once a KB is selected.
✅ After clicking “Start Chat”, the chat input and Send button appear for messaging.

This makes it clearer to users that they need to pick a KB before chatting.



## 🎨 Styling

All styles are scoped under `#akvo-rag`. You can override CSS variables or extend the SCSS if needed.

## 🧱 Development

To develop locally:

```bash
git clone https://github.com/akvo/akvo-rag-js.git
cd akvo-rag-js
npm install
npm run dev
```

### Build
```bash
npm run build # Outputs to dist/
```

### Running Tests
Automated tests are located in `/tests` and use the native Node.js test runner.
```bash
npm test
```


## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a PR.

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
