# LLM Sidebar with Context

This Chrome Extension allows you to interact with Gemini models in a sidebar, using multiple browser tabs as context for your conversations.

## 📦 Installation

<a href="https://chromewebstore.google.com/detail/llm-sidebar-with-context/hecgmgkofmopdcjlbaegcaanaadhomhb">
  <img src="./assets/promotional_images/chrome_web_store_badge.png" width="206" alt="Available in the Chrome Web Store">
</a>

## 🎬 Usage Examples

<div align="center">
  <img src="./assets/promotional_images/promotional_images_slideshow.webp" width="800" alt="LLM Sidebar Demo Slideshow">
</div>

## 🚀 Features

- **Frontend Only:** This extension runs entirely in your browser. There is no middle-man server; your prompts are sent directly from your browser to the Google Gemini API.
- **Infinite Context:** Pin unlimited tabs as context. An adaptive budget manager automatically summarizes or compresses overflow content to fit Gemini's context window, prioritizing passages relevant to your latest prompt before falling back to metadata-only context.
- **Multimodal Support:**
  - **YouTube:** Summarize or answer questions about YouTube videos.
  - **Google Docs:** Extracts content directly from open Google Docs.
  - **Web Pages:** Extracts text content from standard web pages.
- **Current Tab Sharing:** Toggle "Share Current Tab" (Eye icon) to dynamically include the active tab's content in your context as you browse.
- **Model Selection:** Choose between various Gemini models:
  - Gemini 2.5 Flash Lite (Default)
  - Gemini 2.5 Flash
  - Gemini 2.5 Pro
  - Gemini 3 Flash (Preview)
- **Privacy Focused:**
  - Your API Key is stored locally in your browser (`chrome.storage.sync`).
  - Chat history is stored locally (`chrome.storage.local`).
- **Markdown Support:** Responses are rendered with full Markdown support.

## 🛠️ Build Manually (Development)

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/google/llm-sidebar-with-context.git
    cd llm-sidebar-with-context
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Build the extension:**

    ```bash
    npm run build
    ```

    _Note: This generates a `dist/` directory._

4.  **Load into Chrome:**
    1.  Open Chrome and navigate to `chrome://extensions`.
    2.  Enable **Developer mode** (toggle in the top right).
    3.  Click **Load unpacked**.
    4.  Select the `dist` folder created in step 3.

## ⚙️ Configuration

1.  **Get a Gemini API Key:**
    - Visit [Google AI Studio](https://aistudio.google.com/).
    - Create a new API key.

2.  **Setup the Extension:**
    - Click the extension icon <img src="assets/svg-icons/llm-sidebar-logo_16.svg" width="16" alt="Extension Icon"/> in your browser toolbar to open the sidebar.
    - Click the **Settings** button in the bottom panel.
    - Enter your API Key.
    - (Optional) Select your preferred Model.

## 🛠️ Usage

1.  **Open Sidebar:** Click the extension icon <img src="assets/svg-icons/llm-sidebar-logo_16.svg" width="16" alt="Extension Icon"/> in your browser toolbar.
2.  **Pin Context:**
    - Navigate to a page you want to discuss.
    - Click the **Pin** icon next to the "Current Tab" to add it to your pinned context.
    - You can pin unlimited tabs. Content is automatically managed to fit the model's context window.
3.  **Chat:** Type your prompt. The extension will send your message along with the content of all pinned tabs to Gemini.
4.  **Manage Context:**
    - Toggle the **Eye** icon on the "Current Tab" to automatically include whichever tab you are looking at.
    - Click the **Trash** icon to clear a pinned tab.

## 💻 Development

### Prerequisites

- Node.js (v22+)
- npm
- Rust toolchain (for native components)
- Linux: `libxkbcommon-dev libwayland-dev libxrandr-dev libxcursor-dev libxi-dev libxinerama-dev libgl-dev libegl-dev` (for GUI installer)

### Building Everything

```bash
# 1. Chrome extension
npm install
npm run build          # → dist/

# 2. Native messaging host + CLI installer
cd native
cargo build --release -p llm-sidebar-host
cargo build --release -p llm-sidebar-installer

# 3. Overlay companion (macOS/Windows only for the window; daemon works on Linux)
cd native/overlay-companion
cargo build --release

# 4. GUI installer (with setup wizard UI)
cd native
cargo build --release -p llm-sidebar-installer --features gui
```

### Running & Testing

```bash
# Run extension tests (312 tests)
npm test

# Run Rust tests
cd native && cargo test

# Type-check TypeScript
npm run type-check

# Run the installer CLI
native/target/release/llm-sidebar-installer install      # Install everything
native/target/release/llm-sidebar-installer uninstall    # Remove everything
native/target/release/llm-sidebar-installer diagnose     # Check connection health

# Run the GUI setup wizard (requires display server)
native/target/release/llm-sidebar-installer gui

# Run the overlay companion daemon
native/overlay-companion/target/release/overlay-companion daemon

# Run the native messaging host (Chrome launches this automatically)
# Manual test: echo a native messaging frame to it
echo -ne '\x0f\x00\x00\x00{"type":"ping"}' | native/target/release/llm-sidebar-host
```

### Loading the Extension in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `dist/` folder
4. Open sidebar: click the extension icon or press `Ctrl+Shift+S`

### Installing Native Components

After building, run the installer to register native messaging:

```bash
# Option A: CLI installer (headless)
native/target/release/llm-sidebar-installer install

# Option B: GUI setup wizard
native/target/release/llm-sidebar-installer gui

# Verify installation
native/target/release/llm-sidebar-installer diagnose
```

The installer will:
- Copy `llm-sidebar-host` and `overlay-companion` to `~/.local/share/llm-sidebar/` (Linux/macOS) or `%LOCALAPPDATA%\LLMSidebar\` (Windows)
- Detect all installed Chromium browsers (Chrome, Chromium, Brave, Edge, Vivaldi)
- Write native messaging host manifests for each browser
- Register the CRX if found adjacent to the installer

### Commands Reference

| Command                         | Description                                     |
| :------------------------------ | :---------------------------------------------- |
| `npm run build`                 | Builds the extension to `dist/`                 |
| `npm test`                      | Runs unit tests with Vitest (312 tests)         |
| `npm run lint`                  | Runs ESLint                                     |
| `npm run format`                | Formats code with Prettier                      |
| `npm run type-check`            | Runs TypeScript type checking                   |
| `npm run pack-crx`              | Packs extension as signed CRX3                  |
| `npm run test:native-companion` | Runs the Puppeteer/native companion harness     |

### Project Structure

```
├── src/                    # Chrome extension (TypeScript)
│   ├── pages/             # sidebar.html, welcome.html, website.html
│   ├── scripts/           # Controllers, services, memory pipeline
│   └── styles/            # sidebar.css (Kinetic Grid design system)
├── native/                 # Rust native components
│   ├── host/              # Native messaging host (stdin/stdout bridge)
│   ├── installer/         # CLI + GUI installer wizard
│   │   └── src/
│   │       ├── main.rs    # CLI entry: install, uninstall, diagnose, gui
│   │       ├── browsers.rs # Multi-browser detection (Chrome/Brave/Edge/Vivaldi)
│   │       ├── diagnose.rs # Connection health diagnostics
│   │       └── gui.rs     # Egui setup wizard (--features gui)
│   └── overlay-companion/ # Desktop overlay daemon (winit + softbuffer)
├── design-system/          # Kinetic Grid reference screens (HTML + PNG)
├── research/               # UI redesign planning document
├── test-harness/           # Puppeteer native companion test
└── .github/workflows/      # CI: build, package, release (DMG/MSI/deb/CRX)
```

### Native Companion Architecture

```
Chrome Extension
    ↓ native messaging (stdin/stdout, JSON)
llm-sidebar-host (native/host/)
    ↓ JSON-RPC over local IPC socket
overlay-companion daemon (native/overlay-companion/)
    → spawns always-on-top overlay window (macOS/Windows)
```

The native companion is designed around a durable daemon + native-messaging bridge split so the long-lived process can tolerate Chrome MV3 service-worker restarts and reconnect cleanly using JSON-RPC `hello`, `ping`, and `status` messages.

### CI/CD Release Artifacts

On `v*` tag push, CI produces:

| Artifact | Platform |
|----------|----------|
| `llm-sidebar.crx` | All (Chrome extension) |
| `llm-sidebar-extension.zip` | All (Chrome Web Store) |
| `llm-sidebar-linux-amd64.tar.gz` | Linux |
| `llm-sidebar_1.0.0_amd64.deb` | Linux (Debian/Ubuntu) |
| `llm-sidebar-macos-amd64.dmg` | macOS Intel |
| `llm-sidebar-macos-arm64.dmg` | macOS Apple Silicon |
| `llm-sidebar-windows-amd64.msi` | Windows |
| `llm-sidebar-windows-amd64.zip` | Windows |

### Environment Variables

To populate legal links in the Settings panel, create a `.env` file in the root:

```env
LEGAL_NOTICE_URL="https://example.com/legal"
PRIVACY_POLICY_URL="https://example.com/privacy"
LICENSE_URL="https://example.com/license"
```

## 🤝 Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for details.

## 📄 Disclaimer

This project is not an official Google project. It is not supported by Google and Google specifically disclaims all warranties as to its quality, merchantability, or fitness for a particular purpose.

## 📄 License

Apache 2.0; see [`LICENSE`](LICENSE) for details.
