/**
 * Shared overlay data bridge — stable interface for all skins.
 *
 * Provides:
 *  - OverlayBridge.connect()    — start polling extension
 *  - OverlayBridge.onUpdate(cb) — register callback for data changes
 *  - OverlayBridge.action(name) — send an action to the extension
 *
 * Data shape (OverlayState):
 *  {
 *    connected: boolean,
 *    episodes: { count: number, max: number, recent: Array },
 *    pinned: { count: number },
 *    retriever: { hits: string, latency: string },
 *    assembler: { chars: string },
 *    companion: { status: string, overlay: string },
 *    apiKey: { ok: boolean },
 *    ocr: { lastText: string, elapsed: number },
 *    status: string  // "NOMINAL" | "OFFLINE" | "INITIALIZING"
 *  }
 */

const OverlayBridge = (() => {
  const listeners = [];
  let state = {
    connected: false,
    episodes: { count: 0, max: 160, recent: [] },
    pinned: { count: 0 },
    retriever: { hits: '--', latency: '--' },
    assembler: { chars: '--' },
    companion: { status: 'N/A', overlay: 'N/A' },
    apiKey: { ok: false },
    ocr: { lastText: '', elapsed: 0 },
    status: 'INITIALIZING',
  };

  let pollInterval = null;

  function notify() {
    for (const cb of listeners) {
      try {
        cb({ ...state });
      } catch (e) {
        console.error('[overlay-bridge] listener error:', e);
      }
    }
  }

  async function poll() {
    let anySuccess = false;

    // Memory stats
    try {
      const stats = await chrome.runtime.sendMessage({
        type: 'getMemoryStats',
      });
      if (stats && stats.success) {
        anySuccess = true;
        state.episodes = {
          count: stats.episodeCount || 0,
          max: stats.maxEpisodes || 160,
          recent: (stats.recentEpisodes || []).map((e) => ({
            id: e.id,
            summary: e.summary || '',
            keywords: e.keywords || [],
            createdAt: e.createdAt || 0,
          })),
        };
        state.pinned = { count: stats.pinnedTabCount || 0 };
      }
    } catch (_) {}

    // Context snapshot
    try {
      const snap = await chrome.runtime.sendMessage({
        type: 'getContextSnapshot',
      });
      if (snap && snap.success && snap.snapshot) {
        anySuccess = true;
        const s = snap.snapshot;
        state.retriever = {
          hits: s.retrievedEpisodes.length + '/' + s.candidateCount,
          latency: s.elapsed ? s.elapsed + 'ms' : '--',
        };
        state.assembler = {
          chars:
            s.totalChars > 0 ? (s.totalChars / 1000).toFixed(1) + 'K' : '--',
        };
      }
    } catch (_) {}

    // Companion status
    try {
      const comp = await chrome.runtime.sendMessage({
        type: 'nativeCompanionStatus',
      });
      if (comp && comp.success && comp.state) {
        anySuccess = true;
        state.companion = {
          status: comp.state.connectionState || 'unknown',
          overlay: comp.state.overlayStatus || 'unknown',
        };
      }
    } catch (_) {}

    // API key
    try {
      const result = await chrome.storage.sync.get('geminiApiKey');
      state.apiKey = { ok: !!result.geminiApiKey };
    } catch (_) {}

    state.connected = anySuccess;
    state.status = anySuccess ? 'NOMINAL' : 'OFFLINE';

    notify();
  }

  return {
    /** Start polling the extension for data. */
    connect(intervalMs = 3000) {
      if (pollInterval) return;
      poll();
      pollInterval = setInterval(poll, intervalMs);
    },

    /** Stop polling. */
    disconnect() {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    },

    /** Register a callback for state updates. Returns unsubscribe function. */
    onUpdate(cb) {
      listeners.push(cb);
      // Immediately fire with current state
      try {
        cb({ ...state });
      } catch (_) {}
      return () => {
        const idx = listeners.indexOf(cb);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    },

    /** Get current state snapshot. */
    getState() {
      return { ...state };
    },

    /** Send an action to the extension. */
    async action(name, params = {}) {
      const actionMap = {
        toggleOverlay: 'toggleNativeOverlay',
        showOverlay: 'showNativeOverlay',
        hideOverlay: 'hideNativeOverlay',
        clearChat: 'clearChat',
      };
      const type = actionMap[name] || name;
      try {
        return await chrome.runtime.sendMessage({ type, ...params });
      } catch (e) {
        console.error('[overlay-bridge] action failed:', name, e);
        return { success: false, error: e.message };
      }
    },
  };
})();
