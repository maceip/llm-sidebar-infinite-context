import { useState } from 'react';

type ProfileId = 'research' | 'creative' | 'minimal';

const PROFILES: {
  id: ProfileId;
  icon: string;
  title: string;
  desc: string;
  features: string[];
  cta: string;
}[] = [
  {
    id: 'research',
    icon: 'code_blocks',
    title: 'RESEARCH_ENV',
    desc: 'Full context pipeline. Long-term memory, retrieval ranking, auto tab context, and automatic consolidation.',
    features: ['FULL_MEMORY_PIPELINE', 'AUTO_CONSOLIDATION'],
    cta: 'INITIALIZE_RESEARCH',
  },
  {
    id: 'creative',
    icon: 'palette',
    title: 'CREATIVE_STUDIO',
    desc: 'Optimized for freeform exploration. Emphasizes short-term context with rapid forgetting for fresh sessions.',
    features: ['RAPID_CONTEXT', 'FRESH_SESSION_MODE'],
    cta: 'INITIALIZE_CREATIVE',
  },
  {
    id: 'minimal',
    icon: 'settings_input_component',
    title: 'CORE_UTILITY',
    desc: 'Minimal memory footprint. Chat-only mode with no persistent storage. Ideal for quick lookups.',
    features: ['ZERO_PERSISTENCE', 'LOW_OVERHEAD'],
    cta: 'INITIALIZE_CORE',
  },
];

interface Props {
  selected: ProfileId | null;
  onSelect: (id: ProfileId) => void;
}

export function ConfigStep({ selected, onSelect }: Props) {
  const [customIntent, setCustomIntent] = useState('');

  return (
    <main className="flex-grow pt-32 pb-40 px-10 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-16 grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-8">
          <h1 className="font-[Manrope] font-extrabold text-5xl tracking-[0.05em] text-[#1a1c1b] mb-4">
            CONFIGURATION_PROFILES
          </h1>
          <p className="text-[#5f5e5e] font-medium max-w-2xl text-lg leading-relaxed">
            Select a memory configuration. The sidebar will pre-configure the
            pipeline based on your selection.
          </p>
        </div>
        <div className="col-span-12 md:col-span-4 flex md:justify-end items-start pt-2">
          <div className="bg-[#eeeeeb] px-4 py-2 border-l-2 border-[#982616]">
            <span className="font-[Inter] text-[10px] font-black tracking-[0.1em] uppercase text-[#5f5e5e] block mb-1">
              CURRENT_STEP
            </span>
            <span className="font-[Manrope] font-bold text-xl tracking-tighter">
              02 / 04
            </span>
          </div>
        </div>
      </div>

      {/* Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {PROFILES.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="group relative flex flex-col text-left bg-[#f4f4f1] p-8 border transition-all duration-200 outline-none focus:ring-2 focus:ring-[#982616] h-[420px]"
            style={{
              borderColor:
                selected === p.id ? '#982616' : 'rgba(224, 191, 185, 0.2)',
              background: selected === p.id ? '#eeeeeb' : '#f4f4f1',
            }}
          >
            {selected === p.id && (
              <div className="absolute top-4 right-4">
                <span className="material-symbols-outlined text-[#982616]">
                  check_circle
                </span>
              </div>
            )}
            <div className="mb-auto">
              <span className="material-symbols-outlined text-[#982616] text-4xl mb-6 block">
                {p.icon}
              </span>
              <h3 className="font-[Manrope] font-black text-2xl tracking-[0.05em] mb-4">
                {p.title}
              </h3>
              <p className="text-[#5f5e5e] text-sm leading-relaxed mb-6">
                {p.desc}
              </p>
              <ul className="space-y-2">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-[11px] font-[Inter] font-bold tracking-wider text-[#58413d] uppercase"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      check_circle
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-[#e0bfb9]/10 group-hover:border-[#982616]/30 transition-colors">
              <span className="text-[10px] font-black tracking-[0.15em] text-[#982616] uppercase">
                {p.cta}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Custom Intent */}
      <div className="max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <span className="material-symbols-outlined text-[#5f5e5e]">
            psychology
          </span>
          <h2 className="font-[Manrope] font-bold text-xs uppercase tracking-[0.2em] text-[#5f5e5e]">
            CUSTOM_INTENT_OVERRIDE
          </h2>
        </div>
        <div className="relative">
          <textarea
            value={customIntent}
            onChange={(e) => setCustomIntent(e.target.value)}
            className="w-full bg-[#f4f4f1] border border-[#e0bfb9]/30 focus:border-[#982616] focus:ring-0 focus:outline-none p-6 font-[Inter] text-[#1a1c1b] placeholder:text-[#8c716c]/50 resize-none inner-well"
            placeholder="Describe how you'll use this (e.g., 'I need full memory but no auto-consolidation')."
            rows={3}
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-2 pointer-events-none">
            <span className="text-[9px] font-black font-[Inter] text-[#8c716c] uppercase tracking-widest">
              AI_ANALYSIS_READY
            </span>
            <div className="w-1.5 h-1.5 bg-[#5a7033] animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}

export type { ProfileId };
