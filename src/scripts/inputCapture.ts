/**
 * Content script — captures user prompts from AI chat pages and any
 * significant text submissions, then forwards them to the background
 * service worker for memory episode recording.
 *
 * Supports: ChatGPT, Gemini, Claude, Perplexity, Poe, and generic forms.
 */

const MIN_INPUT_LENGTH = 20;
const DEBOUNCE_MS = 3000;
const RESPONSE_WAIT_MS = 60000; // 60s — models with thinking can take a while

let lastCapturedText = '';
let lastCapturedTime = 0;
let observerActive = false;

function isDuplicate(text: string): boolean {
  const now = Date.now();
  if (text === lastCapturedText && now - lastCapturedTime < DEBOUNCE_MS)
    return true;
  lastCapturedText = text;
  lastCapturedTime = now;
  return false;
}

function sendToBackground(userText: string, responseText: string) {
  try {
    chrome.runtime.sendMessage({
      type: 'capturedInput',
      userText,
      responseText,
      url: location.href,
      title: document.title,
      timestamp: Date.now(),
    });
  } catch {
    // Extension context invalidated
  }
}

// ── Site-specific input detection ───────────────────────────────────

type SiteConfig = {
  name: string;
  match: RegExp;
  getInputText: () => string;
  clearCheck?: () => boolean; // returns true if input was cleared (= submitted)
  getLatestResponse: () => string;
};

const SITES: SiteConfig[] = [
  {
    name: 'chatgpt',
    match: /chat\.openai\.com|chatgpt\.com/,
    getInputText() {
      const el =
        document.querySelector<HTMLTextAreaElement>(
          'textarea#prompt-textarea',
        ) || document.querySelector<HTMLTextAreaElement>('textarea');
      return el?.value?.trim() || '';
    },
    getLatestResponse() {
      const msgs = document.querySelectorAll(
        '[data-message-author-role="assistant"]',
      );
      const last = msgs[msgs.length - 1] as HTMLElement;
      return last?.innerText?.trim().slice(0, 2000) || '';
    },
  },
  {
    name: 'gemini',
    match: /gemini\.google\.com/,
    getInputText() {
      // Gemini uses rich-textarea with shadow DOM, or a plain contenteditable
      const rich = document.querySelector('rich-textarea');
      if (rich?.shadowRoot) {
        const inner =
          rich.shadowRoot.querySelector<HTMLElement>(
            '[contenteditable="true"]',
          ) || rich.shadowRoot.querySelector<HTMLElement>('.ql-editor');
        if (inner) return (inner.innerText || inner.textContent || '').trim();
      }
      // Fallback: query inside rich-textarea directly (sometimes no shadow DOM)
      if (rich) {
        const inner = rich.querySelector<HTMLElement>(
          '[contenteditable="true"]',
        );
        if (inner) return (inner.innerText || inner.textContent || '').trim();
      }
      // Fallback: any contenteditable near the bottom
      const editables = document.querySelectorAll<HTMLElement>(
        '[contenteditable="true"]',
      );
      const last = editables[editables.length - 1];
      return last ? (last.innerText || '').trim() : '';
    },
    getLatestResponse() {
      // Gemini response containers
      const msgs = document.querySelectorAll(
        'message-content.model-response-text, .model-response-text, .response-container',
      );
      const last = msgs[msgs.length - 1] as HTMLElement;
      if (last) return last.innerText?.trim().slice(0, 2000) || '';
      // Fallback: markdown containers
      const md = document.querySelectorAll('.markdown');
      const lastMd = md[md.length - 1] as HTMLElement;
      return lastMd?.innerText?.trim().slice(0, 2000) || '';
    },
  },
  {
    name: 'claude',
    match: /claude\.ai/,
    getInputText() {
      const el =
        document.querySelector<HTMLElement>(
          'div.ProseMirror[contenteditable="true"]',
        ) || document.querySelector<HTMLElement>('[contenteditable="true"]');
      return el ? (el.innerText || '').trim() : '';
    },
    getLatestResponse() {
      const msgs = document.querySelectorAll(
        '[data-is-streaming], .font-claude-message',
      );
      const last = msgs[msgs.length - 1] as HTMLElement;
      return last?.innerText?.trim().slice(0, 2000) || '';
    },
  },
  {
    name: 'perplexity',
    match: /perplexity\.ai/,
    getInputText() {
      const el =
        document.querySelector<HTMLTextAreaElement>('textarea') ||
        document.querySelector<HTMLElement>('[contenteditable="true"]');
      if (el instanceof HTMLTextAreaElement) return el.value.trim();
      return el ? (el.innerText || '').trim() : '';
    },
    getLatestResponse() {
      const answers = document.querySelectorAll('.prose');
      const last = answers[answers.length - 1] as HTMLElement;
      return last?.innerText?.trim().slice(0, 2000) || '';
    },
  },
];

function detectSite(): SiteConfig | null {
  for (const site of SITES) {
    if (site.match.test(location.href)) return site;
  }
  return null;
}

// ── Response waiting ────────────────────────────────────────────────

function waitForResponse(site: SiteConfig): Promise<string> {
  return new Promise((resolve) => {
    // Snapshot current response count
    const initialResponse = site.getLatestResponse();

    let resolved = false;
    const done = (text: string) => {
      if (resolved) return;
      resolved = true;
      observer.disconnect();
      clearTimeout(timeout);
      resolve(text);
    };

    const timeout = setTimeout(() => {
      const resp = site.getLatestResponse();
      done(resp !== initialResponse ? resp : '');
    }, RESPONSE_WAIT_MS);

    // Wait for response to stop growing (streaming finished)
    let lastSeenLength = 0;
    let stableCount = 0;

    const observer = new MutationObserver(() => {
      const resp = site.getLatestResponse();
      if (!resp || resp === initialResponse) return;

      if (resp.length === lastSeenLength) {
        stableCount++;
        // Response hasn't changed for ~3 checks (1.5s) — likely done streaming
        if (stableCount >= 3) {
          done(resp);
        }
      } else {
        stableCount = 0;
        lastSeenLength = resp.length;
      }
    });

    // Check stability every 500ms instead of on every mutation
    const stabilityCheck = setInterval(() => {
      const resp = site.getLatestResponse();
      if (!resp || resp === initialResponse) return;

      if (resp.length === lastSeenLength) {
        stableCount++;
        if (stableCount >= 6) {
          // 3 seconds of no change
          clearInterval(stabilityCheck);
          done(resp);
        }
      } else {
        stableCount = 0;
        lastSeenLength = resp.length;
      }
    }, 500);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  });
}

// ── Core capture logic ──────────────────────────────────────────────

async function captureFromSite(site: SiteConfig, inputText: string) {
  if (inputText.length < MIN_INPUT_LENGTH) return;
  if (isDuplicate(inputText)) return;

  console.log(
    `[InputCapture] Captured from ${site.name}: "${inputText.slice(0, 60)}..."`,
  );

  const responseText = await waitForResponse(site);
  console.log(
    `[InputCapture] Response (${responseText.length} chars): "${responseText.slice(0, 60)}..."`,
  );

  sendToBackground(inputText, responseText || `[prompt on ${site.name}]`);
}

// ── Submission detection via input clearing ─────────────────────────
// The most reliable signal that a message was sent: the input gets cleared.

function watchInputClearing(site: SiteConfig) {
  let lastText = '';
  const checkInterval = setInterval(() => {
    const currentText = site.getInputText();

    // Input had meaningful text and is now empty/near-empty = submitted
    if (lastText.length >= MIN_INPUT_LENGTH && currentText.length < 5) {
      captureFromSite(site, lastText);
    }

    if (currentText.length > 0) {
      lastText = currentText;
    }
  }, 300);

  return checkInterval;
}

// ── Generic fallback for non-AI sites ───────────────────────────────

function setupGenericCapture() {
  // Enter key in textareas
  document.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey) return;
      const target = e.target as HTMLElement;
      if (!target) return;

      if (target instanceof HTMLTextAreaElement) {
        const text = target.value.trim();
        if (text.length >= MIN_INPUT_LENGTH && !isDuplicate(text)) {
          sendToBackground(text, `[form input on ${document.title}]`);
        }
      } else if (target.isContentEditable) {
        const text = (target.innerText || '').trim();
        if (text.length >= MIN_INPUT_LENGTH && !isDuplicate(text)) {
          sendToBackground(text, `[input on ${document.title}]`);
        }
      }
    },
    true,
  );

  // Form submissions
  document.addEventListener(
    'submit',
    (e: Event) => {
      const form = e.target as HTMLFormElement;
      const textarea = form?.querySelector('textarea');
      if (textarea && textarea.value.trim().length >= MIN_INPUT_LENGTH) {
        if (!isDuplicate(textarea.value.trim())) {
          sendToBackground(
            textarea.value.trim(),
            `[form submit on ${document.title}]`,
          );
        }
      }
    },
    true,
  );
}

// ── Initialize ──────────────────────────────────────────────────────

function init() {
  if (observerActive) return;
  observerActive = true;

  const site = detectSite();

  if (site) {
    console.log(`[InputCapture] Detected AI site: ${site.name}`);
    // Use the input-clearing detection method — most reliable across all sites
    watchInputClearing(site);
  } else {
    // Generic capture for non-AI pages
    setupGenericCapture();
  }
}

// Run on load, and re-check if the page does SPA navigation
init();

// Handle SPA navigations
let lastUrl = location.href;
const urlObserver = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    observerActive = false;
    init();
  }
});
urlObserver.observe(document.body, { childList: true, subtree: true });
