export function WelcomeStep() {
  return (
    <main className="min-h-screen pt-32 pb-48 px-10 max-w-7xl mx-auto">
      <section className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
        {/* Left Column: Branding */}
        <div className="md:col-span-7 flex flex-col gap-12">
          <div className="space-y-4">
            <p className="font-[Inter] text-xs uppercase tracking-[0.15em] text-[#5f5e5e] font-bold">
              CORE_PLATFORM
            </p>
            <h2 className="font-[Manrope] text-7xl font-extrabold tracking-tight text-[#1a1c1b] leading-none">
              CONTEXT_OS
            </h2>
            <p className="font-[Manrope] text-xl font-bold tracking-[0.05em] text-[#982616]">
              BUILD 3.0.1
            </p>
          </div>
          <div className="max-w-md">
            <p className="text-lg text-[#58413d] leading-relaxed font-[Inter]">
              Let's configure your installation of Context_OS. Your AI memory
              layer runs entirely in the browser — private, persistent, and
              precision-engineered.
            </p>
          </div>
          {/* Manifest Info Inlay */}
          <div className="bg-[#f4f4f1] p-8 border border-[#e0bfb9]/20 max-w-lg inner-well">
            <div className="flex items-start gap-6">
              <div className="w-1 bg-[#982616] h-12 flex-shrink-0" />
              <div className="space-y-2">
                <span className="font-[Inter] text-[10px] uppercase tracking-widest text-[#5f5e5e] font-black">
                  MANIFEST_INFO
                </span>
                <p className="text-sm font-medium text-[#1a1c1b]">
                  Installer initialized. Memory pipeline verified. All
                  subsystems nominal.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status */}
        <div className="md:col-span-5 grid grid-cols-1 gap-6">
          <div className="bg-[#e2e3e0] p-8 border border-[#e0bfb9]/30 flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <span className="font-[Inter] text-[11px] uppercase tracking-widest text-[#5f5e5e] font-black">
                ENVIRONMENT_REPORT
              </span>
              <span className="material-symbols-outlined text-[#982616] text-sm">
                verified
              </span>
            </div>
            <div className="space-y-6">
              <StatusRow label="SYSTEM STATUS" value="READY" highlight />
              <StatusRow label="STORAGE" value="LOCAL ONLY" />
              <StatusRow label="PRIVACY" value="BROWSER-BOUND" />
            </div>
          </div>

          {/* Decorative element */}
          <div className="h-48 bg-[#f4f4f1] border border-[#e0bfb9]/10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 flex flex-col justify-between p-4 font-mono text-[8px] text-[#1a1c1b] pointer-events-none">
              <div>0x004F2A // MEMORY_PIPELINE_OPEN</div>
              <div className="self-end">EPISODES: 0 / 160</div>
            </div>
            <div className="absolute bottom-4 left-4 flex gap-1">
              <div className="w-1 h-1 bg-[#982616]" />
              <div className="w-1 h-1 bg-[#5f5e5e]/30" />
              <div className="w-1 h-1 bg-[#5f5e5e]/30" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatusRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-end border-b border-[#e0bfb9]/20 pb-2">
      <span className="font-[Inter] text-xs uppercase tracking-tighter text-[#58413d]">
        {label}
      </span>
      <span
        className="font-[Manrope] font-bold tracking-wide"
        style={{ color: highlight ? '#982616' : '#1a1c1b' }}
      >
        {value}
      </span>
    </div>
  );
}
