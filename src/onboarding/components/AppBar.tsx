interface AppBarProps {
  statusText: string;
}

export function AppBar({ statusText }: AppBarProps) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#f9f9f6] border-b border-[#e0bfb9]/20 flex justify-between items-center px-10 py-6">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[#982616]">
          terminal
        </span>
        <h1 className="font-[Manrope] font-black tracking-[0.1em] text-lg text-[#1a1c1b]">
          CONTEXT_OS_INSTALLER
        </h1>
      </div>
      <div className="flex items-center gap-6">
        <span className="font-[Manrope] tracking-[0.08em] uppercase font-bold text-xs text-[#982616]">
          {statusText}
        </span>
        <span className="material-symbols-outlined text-[#982616]">
          sensors
        </span>
      </div>
    </header>
  );
}
