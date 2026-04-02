import { useState, useEffect } from 'react';

interface Props {
  onComplete?: () => void;
}

export function ProgressStep({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const LOG_MESSAGES = [
    '> Verifying memory pipeline manifest...',
    '> Initializing long-term storage layer...',
    '> Configuring retriever-ranker service...',
    '> Setting up consolidation schedules...',
    '> Applying forgetting policy defaults...',
    '> Warming prompt assembler cache...',
    '> Registering side panel with Chrome...',
    '> Environment configuration complete.',
  ];

  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      if (step >= LOG_MESSAGES.length) {
        clearInterval(interval);
        // Auto-advance to complete step after a short delay
        setTimeout(() => onComplete?.(), 800);
        return;
      }
      setProgress(((step + 1) / LOG_MESSAGES.length) * 100);
      setLogs((prev) => [...prev, LOG_MESSAGES[step]]);
      step++;
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const done = progress >= 100;

  return (
    <main className="flex-grow flex flex-col md:flex-row p-10 md:p-20 gap-16 overflow-hidden pt-32">
      {/* Left: Progress */}
      <section className="flex-1 flex flex-col justify-between max-w-2xl">
        <div>
          <label className="text-xs uppercase tracking-[0.08em] text-[#5f5e5e] mb-2 block font-medium font-[Inter]">
            Current Operation
          </label>
          <h2 className="font-[Manrope] text-5xl md:text-7xl font-extrabold tracking-[0.05em] text-[#1a1c1b] leading-tight">
            {done ? 'SETUP_COMPLETE' : 'CONFIGURING...'}
          </h2>

          <div className="mt-16 relative">
            <div className="flex items-baseline gap-4 mb-4">
              <span className="font-[Manrope] text-8xl font-black tracking-tight text-[#982616]">
                {Math.round(progress)}
              </span>
              <span className="font-[Manrope] text-4xl font-bold text-[#e0bfb9]">
                %
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-[2px] bg-[#eeeeeb] overflow-hidden">
              <div
                className="h-full bg-[#982616] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-4">
              <span className="text-[10px] font-black tracking-[0.1em] uppercase text-[#5f5e5e]">
                {logs.length} / {LOG_MESSAGES.length} TASKS
              </span>
              <span className="text-[10px] font-black tracking-[0.1em] uppercase text-[#982616]">
                {done ? 'DONE' : 'PROCESSING...'}
              </span>
            </div>
          </div>
        </div>

        {/* Terminal Log */}
        <div className="mt-20">
          <div className="bg-[#f4f4f1] inner-well p-6 border border-[#e0bfb9]/20 font-mono text-xs leading-relaxed text-[#c8c6c5]">
            <div className="flex items-center gap-2 mb-4 opacity-50">
              <div className="w-2 h-2 bg-[#982616] animate-pulse" />
              <span className="uppercase tracking-widest text-[9px] font-bold">
                Live System Output
              </span>
            </div>
            {logs.map((log, i) => (
              <p
                key={i}
                className="mb-1 line-clamp-1"
                style={{
                  color: i === logs.length - 1 ? '#982616' : '#58413d',
                }}
              >
                {log}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Right: Tip Card */}
      <aside className="flex-1 flex flex-col justify-center">
        <div className="bg-[#e2e3e0] p-12 flex flex-col justify-between border border-[#e0bfb9]/10 relative overflow-hidden min-h-[400px]">
          <div className="z-10">
            <span className="bg-[#982616] text-white text-[10px] font-black tracking-[0.2em] px-3 py-1 uppercase inline-block">
              Quick Tip
            </span>
            <h3 className="font-[Manrope] text-3xl font-bold tracking-tight mt-8 leading-tight text-[#1a1c1b]">
              Almost there — your sidebar is being configured.
            </h3>
          </div>
          <div className="z-10">
            <p className="text-[#5f5e5e] leading-relaxed mb-8 max-w-xs">
              All your open tabs are automatically included as context. No
              pinning needed — just open the sidebar and start chatting.
            </p>
            <div className="flex gap-2">
              <div className="w-10 h-[2px] bg-[#982616]" />
              <div className="w-10 h-[2px] bg-[#e0bfb9]/30" />
              <div className="w-10 h-[2px] bg-[#e0bfb9]/30" />
            </div>
          </div>
          {/* Decorative icon */}
          <div className="absolute bottom-12 right-12 opacity-10">
            <span className="material-symbols-outlined text-[120px]">
              keyboard_command_key
            </span>
          </div>
        </div>
      </aside>
    </main>
  );
}
