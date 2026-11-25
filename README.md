# Akvo RAG JS

An embeddable chatbot widget for Akvo RAG.

- **Premium Markdown Rendering**: Supports GitHub Flavored Markdown (GFM), tables, code blocks, and lists with isolated, premium styling.
- **Optimized Streaming UX**: Intelligent text cleaning to prevent mid-word spacing issues during real-time streaming.
- **Cross-Page Chat History Persistence**: Dialogue history automatically rehydrates across route changes and browser refreshes with sliding-window capacity.
- **Strict Multi-User Isolation**: Built-in composite keying (`userId`/`visitorId` + `kb_id`) ensures zero history leakage across different users or shared devices.
- **Configurable Citation Control**: Toggle source citation popovers and badges on or off (`showCitations`) with clean token suppression.
- **Draggable Positioning & Persistence**: Smooth draggable launcher and header with quadrant anchoring and coordinate persistence (ADR-006).
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
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/akvo-rag-js@1.2.2/dist/akvo-rag.css" />
</head>
<body>

<script src="https://cdn.jsdelivr.net/npm/akvo-rag-js@1.2.2/dist/akvo-rag.js"></script>

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

The `initChat` function accepts a configuration object to customize the chat widget behavior, appearance, and dimensions:

| Parameter            | Type                                      | Required | Default              | Description                                                        |
| -------------------- | ----------------------------------------- | -------- | -------------------- | ------------------------------------------------------------------ |
| `title`              | `string`                                  | ✅ Yes    | `"Chatbot"`          | The title displayed in the chat header.                            |
| `wsURL`              | `string`                                  | ✅ Yes    | —                    | WebSocket endpoint URL for real-time chat communication.           |
| `kb_id`              | `number`                                  | ❌ No     | `null`               | Initial Knowledge Base ID to query directly.                       |
| `kb_options`         | `Array<{ kb_id: number, label: string }>` | ❌ No     | `[]`                 | Knowledge Base choices for the user before starting chat.          |
| `persistHistory`     | `boolean`                                 | ❌ No     | `true`               | Preserve conversation transcript across page refreshes / routes.   |
| `userId`             | `string`                                  | ❌ No     | `null`               | Unique user ID for multi-user isolation on shared devices.         |
| `historyStorageType` | `"session" \| "local"`                    | ❌ No     | `"session"`          | Storage backend (`sessionStorage` clears on tab close).            |
| `historyStorageKey`  | `string`                                  | ❌ No     | `"akvo_rag_history"` | Base storage key for chat history persistence.                     |
| `maxHistoryMessages` | `number`                                  | ❌ No     | `20`                 | Maximum conversation turns retained in sliding window history.     |
| `showCitations`      | `boolean`                                 | ❌ No     | `true`               | `true`: Render superscript citation popovers; `false`: strip tags. |
| `draggable`          | `boolean`                                 | ❌ No     | `true`               | Enable draggable positioning for launcher and chat window header.  |
| `persistPosition`    | `boolean`                                 | ❌ No     | `true`               | Persist widget coordinates across reloads in `localStorage`.       |
| `dragThreshold`      | `number`                                  | ❌ No     | `6`                  | Pixel distance threshold before a click becomes a drag.            |
| `primaryColor`       | `string`                                  | ❌ No     | `"#007A78"`          | Primary brand color (`#hex`, `rgb`, `hsl`) cascading via CSS var.  |
| `showLauncher`       | `boolean`                                 | ❌ No     | `true`               | `true`: Floating 56×56px launcher button; `false`: embedded box.   |
| `startMinimized`     | `boolean`                                 | ❌ No     | `true`               | Whether the widget initializes minimized or expanded.             |
| `width`              | `number \| string`                        | ❌ No     | `"360px"`            | Widget width (`400`, `"420px"`, `"25rem"`). Clamped on mobile.    |
| `height`             | `number \| string`                        | ❌ No     | `"500px"`            | Widget height (`560`, `"600px"`, `"80vh"`). Clamped on mobile.   |
| `position`           | `"bottom-right" \| "bottom-left"`         | ❌ No     | `"bottom-right"`     | Viewport corner anchor for both launcher and chat window.          |
| `borderRadius`       | `number \| string`                        | ❌ No     | `"8px"`              | Corner radius (`8`, `"12px"`, `"16px"`).                           |
| `launcherSize`       | `number \| string`                        | ❌ No     | `"56px"`             | Floating launcher button size (`48`, `"56px"`, `"64px"`).          |
| `zIndex`             | `number`                                  | ❌ No     | `99999`              | Stacking index (launcher automatically takes `zIndex - 1`).        |
| `launcherIcon`       | `string`                                  | ❌ No     | Default comments     | Custom SVG markup, image URL, or FontAwesome class string.         |
| `headerIcon`         | `string`                                  | ❌ No     | `null`               | Avatar or icon rendered adjacent to the header title.             |
| `autoReconnect`      | `boolean`                                 | ❌ No     | `true`               | Reconnection with exponential backoff on drop (ADR-005).           |

---

### 💬 Session History & Multi-User Isolation

The widget automatically persists dialogue turns across route changes, SPA navigations, and browser refreshes:

```javascript
const chat = initChat({
  wsURL: "wss://akvo-rag.akvotest.org/ws/chat",
  kb_id: 750,
  persistHistory: true,       // On/off toggle (defaults to true)
  userId: currentUser?.id,    // Scopes storage to this user (prevents cross-user leaks)
  showCitations: false,       // Suppress [citation:X] badges for clean conversational look
});
```

#### How User ID Scoping Works:
1. **Anonymous Visitors (Default)**: If `userId` is omitted, the widget automatically generates a private UUID saved in `localStorage["akvo-visitor-id"]`. Each device maintains its own isolated transcript.
2. **Logged-In Users**: When your application passes `userId: "alice"`, history is stored under `akvo_rag_history_alice_750`. If Bob logs in on the same browser with `userId: "bob"`, he will **never see Alice's history**.
3. **Programmatic Controls**:
   - `chat.clearHistory()`: Purges saved messages from storage for the active user/KB and resets the chat UI.
   - `chat.getHistory()`: Returns a deep copy of the current in-memory message history.

---

### 🔧 Component Lifecycle (`AkvoRagChatbox`)

The `initChat` function returns an instance of `AkvoRagChatbox`. You can use it to manage the widget's lifecycle and programmatic actions:

```javascript
const chat = initChat({ ... });

// Programmatic UI control:
chat.open();       // Expand chat window
chat.minimize();   // Collapse to launcher
chat.close();      // Minimize chat window

// History management:
const messages = chat.getHistory();
chat.clearHistory();

// Clean up connections and DOM elements:
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

You can develop natively with Node.js (v18+) or use the standardized **Docker Compose** environment for cross-platform parity across macOS, Linux, and Windows.

---

### Option A: Standardized Docker Setup (Recommended for Cross-Platform)

Zero-prerequisite setup. Perfect for teams working across macOS, Linux, and Windows:

```bash
# Start development server with live HMR (http://localhost:8080)
./dc.sh up

# Run test suite inside container
./dc.sh test

# Build production bundle inside container
./dc.sh build

# Stop containers
./dc.sh down
```

> **Windows Users**: You can run `./dc.sh` in Git Bash / WSL, or invoke native Docker Compose commands:
> - `docker compose up`
> - `docker compose run --rm app npm test`
> - `docker compose run --rm app npm run build`

---

### Option B: Native Node.js Setup

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
This project is licensed under the AGPL-3.0 License. See the [LICENSE](LICENSE) file for details.
