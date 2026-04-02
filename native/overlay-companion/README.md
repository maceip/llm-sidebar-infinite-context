# Native Overlay Companion

This crate provides the foundation for a small Rust-based native companion for the Chrome extension.

## Modes

- `overlay-companion` (default): native-messaging host bridge launched by Chrome.
- `overlay-companion daemon`: long-lived daemon that owns the local IPC endpoint and, on macOS/Windows, the HUD/overlay window thread.
- `overlay-companion install-assets`: emits the native host manifest and autostart templates.

## Architecture

Chrome talks to the stdio host process via native messaging. The host process forwards JSON-RPC messages over a local socket to the long-lived daemon. This lets the daemon survive extension service-worker restarts while still keeping Chrome integration simple and CDP-free.

## Boot Assets

`install-assets` generates:

- a native messaging host manifest for Chrome for Testing on Linux,
- a launchd LaunchAgent plist template for macOS,
- a Task Scheduler XML template for Windows.

On Windows, native messaging host discovery still requires registry registration (`HKCU`/`HKLM` NativeMessagingHosts`). The current harness foundation fixes command execution issues on Windows but does not yet automate registry registration there.

The daemon answers `hello`, `ping`, and `status` JSON-RPC methods. The intended extension heartbeat cadence is 22 seconds.

## OCR Engine (PP-OCRv5 Mobile ONNX)

Cross-platform text recognition using PP-OCRv5 mobile models (~12.6 MB total). Runs detection + recognition on screen captures to extract text from terminals, AI chat apps, and any visible window.

Models in `models/`:

- `det.onnx` (4.5 MB) -- text region detection
- `rec.onnx` (7.5 MB) -- English text recognition
- `cls.onnx` (569 KB) -- text direction classifier
- `dict.txt` (1.4 KB) -- character dictionary

## Performance Contract

The overlay window must never drop a frame. Zero perceived lag or users will uninstall.

### Rules

1. **OCR never runs on the UI thread.** The overlay render loop (winit event loop) stays untouched. OCR runs on a dedicated background thread with its own cadence.

2. **Screen capture is the bottleneck, not OCR.** Capturing a 1920x1080 region via BitBlt/DXGI takes 5-15ms. The OCR itself (det + rec) is 25-80ms. Total pipeline per cycle: ~40-100ms. That's fine as long as it's off the main thread.

3. **Adaptive polling, not constant.** Don't OCR every frame. Instead:
   - Idle: OCR every 2-3 seconds
   - Active typing detected (pixel diff): OCR every 500ms
   - Input just cleared (submission signal): immediate OCR, then wait for response stabilization

4. **Double-buffer the results.** Background thread writes to an `Arc<Mutex<OcrResult>>`. UI thread reads it. No contention, no blocking.

5. **Diff-based capture.** Don't re-OCR if the screen region hasn't changed. Compare a quick hash of the pixel data before running the full pipeline. Saves ~90% of cycles when the user is just reading.

6. **Model warmup on startup.** First inference is always slow (ONNX Runtime JIT). Run a dummy 32x32 image through both models at launch so the first real call isn't a cold start.

### Thread Architecture

```
[Main thread: winit event loop]     [OCR thread]              [Capture thread]
         |                               |                          |
         |  reads Arc<OcrResult>         |  runs det+rec pipeline   |  grabs screenshots
         |  for HUD rendering            |  writes Arc<OcrResult>   |  writes Arc<ScreenBuffer>
         |                               |  sleeps adaptively       |  pixel-diff gating
         +-------------------------------+--------------------------+
```
