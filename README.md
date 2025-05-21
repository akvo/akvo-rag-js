# Akvo RAG JS

An embeddable chatbot widget for Akvo RAG.

## 🎯 Features

- Embed directly into HTML with `<script>`
- Use as an NPM module with modern frameworks
- Minimize/restore functionality
- Styled with SCSS using scoped ID selector (`#akvo-rag`)
- Font Awesome icons included
- Fully customizable via options

---

## 📦 Installation

### Using NPM

```bash
npm install akvo-rag-js
```

Example Usage:

```javascript
import { initChat } from 'akvo-rag-js';
import 'akvo-rag-js/dist/akvo-rag.css';

initChat({
  title: 'Support Bot',
  token: "<auth-token>",
  kb_id: 39,
  wsURL: "ws://localhost:81/ws/chat",
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
<script>
  AkvoRAG.initChat({
    title: 'Support Bot',
    token: "<auth-token>",
    kb_id: 39,
    wsURL: "ws://localhost:81/ws/chat",
  });
</script>

</body>
</html>
```

## ⚙️ `initChat` Parameters

The `initChat` function accepts a configuration object to customize the chat widget behavior:

| Parameter | Type     | Required | Description                                              |
| --------- | -------- | -------- | -------------------------------------------------------- |
| `title`   | `string` | ✅ Yes    | The title displayed at the top of the chat window.       |
| `token`   | `string` | ✅ Yes    | JWT or access token used for authenticating the user.    |
| `kb_id`   | `number` | ✅ Yes    | The Knowledge Base ID to be used in the RAG backend.     |
| `wsURL`   | `string` | ✅ Yes    | WebSocket endpoint URL for real-time chat communication. |

💡 Additional configuration options may be added in future releases to support themes, positioning, or additional behaviors.

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

Build for production:
```bash
npm run build
```

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a PR.

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
