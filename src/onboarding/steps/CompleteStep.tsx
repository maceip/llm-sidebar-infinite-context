export function CompleteStep() {
  const handleOpenSidebar = () => {
    // Open the side panel via the extension action
    try {
      chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
    } catch {
      // fallback: just close the tab
    }
    window.close();
  };

  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const shortcut = isMac ? '⌘+Shift+S' : 'Ctrl+Shift+S';

  return (
    <main className="flex-grow flex flex-col items-center justify-center px-10 pt-32 pb-40 text-center">
      <div className="max-w-2xl">
        <span className="material-symbols-outlined text-[#5a7033] text-6xl mb-8 block">
          check_circle
        </span>

        <h2 className="font-[Manrope] text-5xl md:text-7xl font-extrabold tracking-[0.05em] text-[#1a1c1b] leading-tight mb-6">
          READY_TO_GO
        </h2>

        <p className="text-lg text-[#58413d] leading-relaxed mb-4">
          Your sidebar is installed and configured. All open tabs are
          automatically included as context — no pinning needed.
        </p>

        <p className="text-sm text-[#8c716c] mb-16">
          Use{' '}
          <kbd className="font-mono bg-[#eeeeeb] px-2 py-0.5 border border-[#e0bfb9]/30 text-[#1a1c1b] text-xs font-bold">
            {shortcut}
          </kbd>{' '}
          anytime to toggle the sidebar, or click the extension icon.
        </p>

        <button
          onClick={handleOpenSidebar}
          className="inline-flex items-center gap-3 bg-[#982616] text-white px-10 py-4 font-[Manrope] font-black text-sm tracking-[0.15em] uppercase hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined">open_in_new</span>
          LAUNCH SIDEBAR
        </button>

        <div className="mt-20 grid grid-cols-3 gap-8 text-left max-w-lg mx-auto">
          <div>
            <span className="material-symbols-outlined text-[#982616] text-2xl mb-3 block">
              auto_awesome
            </span>
            <h4 className="font-[Manrope] font-bold text-xs uppercase tracking-wider mb-1">
              Auto Context
            </h4>
            <p className="text-[11px] text-[#5f5e5e] leading-relaxed">
              All tabs are automatically included as context.
            </p>
          </div>
          <div>
            <span className="material-symbols-outlined text-[#982616] text-2xl mb-3 block">
              memory
            </span>
            <h4 className="font-[Manrope] font-bold text-xs uppercase tracking-wider mb-1">
              Memory
            </h4>
            <p className="text-[11px] text-[#5f5e5e] leading-relaxed">
              Conversations persist across sessions locally.
            </p>
          </div>
          <div>
            <span className="material-symbols-outlined text-[#982616] text-2xl mb-3 block">
              lock
            </span>
            <h4 className="font-[Manrope] font-bold text-xs uppercase tracking-wider mb-1">
              Private
            </h4>
            <p className="text-[11px] text-[#5f5e5e] leading-relaxed">
              Everything stays in your browser.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
