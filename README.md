# Akvo RAG JS

An embeddable chatbot widget for Akvo RAG.

## 🎯 Features

- Embed directly into HTML with `<script>`
- Use as an NPM module with modern frameworks
- Minimize/restore functionality
- Styled with SCSS using scoped ID selector (`#akvo-rag-chatbot`)
- Font Awesome icons included
- Fully customizable via options

---

## 📦 Installation

### Using NPM

```bash
npm install akvo-rag-chatbot
```

Example Usage:

```javascript
import { initChat } from 'akvo-rag';
import 'akvo-rag-js/dist/akvo-rag.css';

initChatbot({
  title: 'Support Bot',
});

```

### Using CDN

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Chatbot Demo</title>
  <link rel="stylesheet" href="dist/akvo-rag.css" />
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css "
  />
</head>
<body>

<div id="akvo-rag-chatbot"></div>

<script src="dist/akvo-rag.js"></script>
<script>
  AkvoRAG.initChat({
    title: 'Support Bot',
  });
</script>

</body>
</html>
```

## 🎨 Styling 

All styles are scoped under `#akvo-rag-chatbot`. You can override CSS variables or extend the SCSS if needed. 

## 🧱 Development 

To develop locally: 

```bash
git clone https://github.com/yourname/akvo-rag-chatbot.git 
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
