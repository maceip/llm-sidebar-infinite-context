import { useState } from 'react';

interface Props {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export function ApiKeyStep({ apiKey, onApiKeyChange }: Props) {
  const [showKey, setShowKey] = useState(false);

  const deps = [
    {
      name: 'Gemini API Key',
      status: apiKey.length > 10 ? 'ok' : 'missing',
      icon: apiKey.length > 10 ? 'check_circle' : 'error',
    },
    { name: 'Chrome Side Panel', status: 'ok', icon: 'check_circle' },
    { name: 'Local Storage', status: 'ok', icon: 'check_circle' },
    { name: 'Memory Pipeline', status: 'queued', icon: 'pending' },
  ];

  return (
    <main className="flex-grow pt-32 pb-40 px-10 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="mb-20">
        <span className="font-[Inter] text-xs font-black tracking-[0.2em] text-[#5f5e5e] uppercase mb-2 block">
          STEP_03
        </span>
        <h2 className="font-[Manrope] text-5xl font-extrabold tracking-[0.05em] text-[#1a1c1b] uppercase">
          API_KEY_&_ENVIRONMENT
        </h2>
        <div className="h-1 w-24 bg-[#982616] mt-6" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
        {/* Left: API Key Input */}
        <div className="md:col-span-7 space-y-16">
          <section>
            <label className="font-[Inter] text-[10px] font-black tracking-[0.1em] text-[#5f5e5e] uppercase mb-4 block">
              GEMINI_API_KEY
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#8c716c]">
                  key
                </span>
              </div>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                className="w-full h-14 bg-[#f4f4f1] etch-border inner-well pl-12 pr-24 text-sm font-mono tracking-tight focus:ring-0 focus:border-[#982616] focus:outline-none transition-all text-[#1a1c1b]"
                placeholder="Paste your Gemini API key..."
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="text-[10px] font-black tracking-widest text-[#982616] uppercase px-3 py-1 bg-[#f9f9f6] border border-[#8c716c]/20 hover:bg-[#e2e3e0] transition-colors"
                >
                  {showKey ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>
            <p className="mt-4 text-[10px] font-[Inter] font-bold text-[#8c716c] uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">
                info
              </span>
              Get a free key at{' '}
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#982616] underline"
              >
                aistudio.google.com
              </a>
            </p>
          </section>

          {/* Key Status Visualization */}
          <section className="bg-[#f4f4f1] p-8 etch-border inner-well">
            <div className="flex justify-between items-end mb-6">
              <div>
                <label className="font-[Inter] text-[10px] font-black tracking-[0.1em] text-[#5f5e5e] uppercase mb-1 block">
                  CONFIGURATION_STATUS
                </label>
                <span className="text-xl font-[Manrope] font-bold tracking-tight">
                  {apiKey.length > 10 ? 'KEY_VERIFIED' : 'AWAITING_INPUT'}
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-10 w-full bg-[#e2e3e0] flex overflow-hidden">
              <div
                className="h-full bg-[#982616] flex items-center justify-center transition-all duration-500 relative overflow-hidden"
                style={{ width: apiKey.length > 10 ? '75%' : '25%' }}
              >
                <span className="text-[9px] font-black text-white uppercase z-10">
                  {apiKey.length > 10 ? 'CONFIGURED' : 'PENDING'}
                </span>
              </div>
              <div className="h-full bg-transparent flex-grow" />
            </div>
          </section>
        </div>

        {/* Right: Dependency Checklist */}
        <div className="md:col-span-5">
          <section className="bg-[#eeeeeb] border-l-4 border-[#982616] p-10 h-full">
            <label className="font-[Inter] text-[10px] font-black tracking-[0.1em] text-[#5f5e5e] uppercase mb-8 block">
              DEPENDENCY_CHECKLIST
            </label>
            <ul className="space-y-8">
              {deps.map((dep) => (
                <li key={dep.name} className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <span
                      className="material-symbols-outlined text-lg"
                      style={{
                        color:
                          dep.status === 'ok'
                            ? '#42571e'
                            : dep.status === 'missing'
                              ? '#982616'
                              : '#8c716c',
                      }}
                    >
                      {dep.icon}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold tracking-wider uppercase text-[#1a1c1b]">
                        {dep.name}
                      </h4>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-black uppercase"
                    style={{
                      color:
                        dep.status === 'ok'
                          ? '#42571e'
                          : dep.status === 'missing'
                            ? '#982616'
                            : '#8c716c',
                    }}
                  >
                    [{dep.status.toUpperCase()}]
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-12 pt-8 border-t border-[#8c716c]/10">
              <p className="text-[11px] text-[#58413d] leading-relaxed italic">
                Your API key is stored locally in Chrome and never sent to any
                server except the Gemini API.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
