/**
 * Injected into the active tab to show/toggle the skin overlay.
 * Creates an iframe pointing to the extension's overlay HTML.
 */
(() => {
  const OVERLAY_ID = '__context_os_overlay__';
  const existing = document.getElementById(OVERLAY_ID);

  if (existing) {
    // Toggle visibility
    existing.style.display =
      existing.style.display === 'none' ? 'block' : 'none';
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.id = OVERLAY_ID;
  iframe.src = (window as any).__CONTEXT_OS_OVERLAY_URL__;
  iframe.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2147483647;
    border: none;
    background: transparent;
    pointer-events: none;
  `;
  // Allow pointer events only on the skin itself
  iframe.setAttribute('allowtransparency', 'true');

  document.documentElement.appendChild(iframe);

  // Forward pointer events through transparent areas
  iframe.addEventListener('load', () => {
    try {
      const iframeDoc = iframe.contentDocument;
      if (iframeDoc) {
        iframeDoc.body.style.pointerEvents = 'none';
        const root = iframeDoc.querySelector('.skin-root');
        if (root) {
          (root as HTMLElement).style.pointerEvents = 'auto';
        }
      }
    } catch (_) {
      // Cross-origin, can't access — that's fine
    }
  });
})();
