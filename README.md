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
- Rust toolchain
- Linux GUI installer dependencies: `libxkbcommon-dev libwayland-dev libxrandr-dev libxcursor-dev libxi-dev libxinerama-dev libgl-dev libegl-dev`

### Native companion platform support

| Platform | Native bridge | Visible overlay window |
|----------|---------------|------------------------|
| Linux | Yes | No — bridge/daemon only |
| macOS | Yes | Yes |
| Windows | Yes | Yes |

The extension talks to the Rust companion through a single native-messaging host:
`com.maceip.native_overlay_companion`.

### Development quickstart

```bash
# Install JS dependencies once
npm install
npm run build:extension   # -> dist/

# 2. Native components
npm run build:native

# 3. Package installer bundle (extension + native + dev CRX)
npm run build:package
```

### Running & Testing

```bash
# Run extension tests
npm test

# Type-check TypeScript
npm run type-check

# Run the native/browser harness
npm run test:native-companion

# Run the installer path
npm run installer:install
npm run installer:uninstall
```

### Load the unpacked extension

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the repo `dist/` directory
5. Open the sidebar by clicking the extension icon or pressing `Ctrl+Shift+S`

If the native companion is installed correctly:

The npm-wired installer path is:

```bash
npm run build:package
npm run installer:install
- macOS / Windows should eventually show **Native OK**
- Linux should show **Bridge Only** (the JSON-RPC bridge is connected, but the visible overlay window is intentionally unsupported today)

### Native build and install commands

```bash
# Extension
npm run build:extension

# Native companion host/daemon
npm run build:native

# Installer CLI
npm run build:installer

# Installer GUI (requires display server)
npm run build:installer:gui

# Install / uninstall / diagnose
npm run native:install
npm run native:diagnose
native/target/release/llm-sidebar-installer uninstall

# Optional: run the companion daemon directly
native/overlay-companion/target/release/overlay-companion daemon
```

This stages a bundle in `dist-installer/` containing:
- `llm-sidebar-installer`
- `overlay-companion`
- `llm-sidebar.crx`
- `llm-sidebar-extension-id.txt`

The installer will:
- Copy `overlay-companion` to `~/.local/share/llm-sidebar/` (Linux/macOS) or `%LOCALAPPDATA%\LLMSidebar\` (Windows)
- Detect all installed Chromium browsers (Chrome, Chromium, Brave, Edge, Vivaldi, Chrome for Testing)
- Write native messaging host manifests for each browser
- Register the CRX if found adjacent to the installer

For production CRX packaging, provide `CRX_PRIVATE_KEY`. The default npm packaging path uses a reusable local development key.

### Commands Reference

| Command                         | Description                                     |
| :------------------------------ | :---------------------------------------------- |
| `npm run build`                 | Builds the extension to `dist/`                 |
| `npm run build:native`          | Builds the Rust host, installer, and overlay companion |
| `npm run build:package`         | Builds extension, native binaries, CRX, and staged installer assets |
| `npm run installer:install`     | Builds package artifacts and runs the Rust installer |
| `npm run installer:uninstall`   | Runs the Rust installer uninstall flow          |
| `npm test`                      | Runs unit tests with Vitest                     |
| `npm run lint`                  | Runs ESLint                                     |
| `npm run format`                | Formats code with Prettier                      |
| `npm run type-check`            | Runs TypeScript type checking                   |
| `npm run pack-crx`              | Packs extension as signed CRX3                  |
| `npm run test:native-companion` | Runs the Puppeteer/native companion harness     |

- copy `overlay-companion` into `~/.local/share/llm-sidebar/` (Linux/macOS) or `%LOCALAPPDATA%\LLMSidebar\` (Windows)
- detect installed Chromium-family browsers
- write native messaging host manifests for each detected browser
- optionally register a `.crx` if one is staged beside the installer

### End-to-end verification

Run the installer-driven Puppeteer harness:

```bash
npm run test:native-companion
```

The harness:

1. builds the extension
2. builds `overlay-companion`
3. builds `llm-sidebar-installer`
4. stages the installer and companion into an isolated temp home
5. runs the installer against that isolated browser profile
6. loads the unpacked extension in Chrome
7. verifies native connectivity + heartbeat
8. verifies the browser memory path

### Troubleshooting

- **Sidebar says “No Native”**
  - run `npm run native:diagnose`
  - confirm the manifest exists under your browser's `NativeMessagingHosts` directory
  - confirm you loaded the same extension ID/origin the installer registered

- **Sidebar says “Bridge Only” on Linux**
  - this is expected when native messaging is connected successfully
  - Linux currently validates the bridge/daemon only, not a visible overlay window

- **Installer reports no browsers detected**
  - launch Chrome/Chromium once so its config directory exists
  - rerun `npm run native:install`

- **Using a different extension ID**
  - the installer supports `--extension-id <id>`
  - the dev harness derives its extension ID from `test-harness/native-companion/dev-extension-key.txt`

- **Packaged CRX vs development**
  - day-to-day development uses the unpacked extension from `dist/`
  - packaged CRX/MSI/DMG/deb artifacts are for distribution

### Commands reference

| Command | Description |
| :------ | :---------- |
| `npm run build` | Builds the extension to `dist/` |
| `npm run build:extension` | Alias for the extension build |
| `npm run build:native` | Builds `overlay-companion` |
| `npm run build:installer` | Builds `llm-sidebar-installer` |
| `npm run build:installer:gui` | Builds the installer with GUI support |
| `npm run native:install` | Runs the installer CLI |
| `npm run native:diagnose` | Runs installer diagnostics against the installed companion |
| `npm test` | Runs unit tests with Vitest |
| `npm run type-check` | Runs TypeScript type checking |
| `npm run lint` | Runs ESLint |
| `npm run pack-crx` | Packs the extension as CRX3 |
| `npm run test:native-companion` | Runs the installer-driven Puppeteer/native companion harness |

### Project Structure

```
├── src/                    # Chrome extension (TypeScript)
│   ├── pages/              # sidebar.html, welcome.html, etc.
│   ├── scripts/            # controllers, services, memory pipeline, native bridge
│   └── styles/             # sidebar.css
├── native/                 # Rust native components
│   ├── host/              # Legacy ping-only native host (not the primary integration path)
│   ├── installer/         # CLI + GUI installer wizard
│   │   └── src/
│   │       ├── main.rs    # CLI entry: install, uninstall, diagnose, gui
│   │       ├── browsers.rs # Multi-browser detection (Chrome/Brave/Edge/Vivaldi)
│   │       ├── diagnose.rs # Connection health diagnostics
│   │       └── gui.rs     # Egui setup wizard (--features gui)
│   └── overlay-companion/ # Native host + daemon + desktop overlay foundation
├── build-scripts/          # build, pack, and installer staging scripts
├── design-system/          # Kinetic Grid reference screens (HTML + PNG)
├── research/               # UI redesign planning document
├── test-harness/           # Puppeteer native companion test
└── .github/workflows/      # CI: build, package, release (DMG/MSI/deb/CRX)
```

### Native Companion Architecture

```
Chrome Extension
    ↓ native messaging (stdio JSON-RPC)
overlay-companion host bridge
    ↓ local IPC JSON-RPC
overlay-companion daemon
    → visible overlay/HUD target on macOS and Windows
```

The native companion is designed around a durable daemon + native-messaging bridge split so the long-lived process can tolerate Chrome MV3 service-worker restarts and reconnect cleanly using JSON-RPC `hello`, `ping`, and `status` messages.

The harness builds the extension, builds the Rust binaries, runs the installer in an isolated browser home, launches Chrome headless with the unpacked extension, verifies a browser-run memory-layer scenario through the real extension storage/API surface, and verifies native companion connectivity through a real heartbeat/pong cycle.

| Artifact                         | Platform               |
| -------------------------------- | ---------------------- |
| `llm-sidebar.crx`                | All (Chrome extension) |
| `llm-sidebar-extension.zip`      | All (Chrome Web Store) |
| `llm-sidebar-linux-amd64.tar.gz` | Linux                  |
| `llm-sidebar_1.0.0_amd64.deb`    | Linux (Debian/Ubuntu)  |
| `llm-sidebar-macos-amd64.dmg`    | macOS Intel            |
| `llm-sidebar-macos-arm64.dmg`    | macOS Apple Silicon    |
| `llm-sidebar-windows-amd64.msi`  | Windows                |
| `llm-sidebar-windows-amd64.zip`  | Windows                |

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
