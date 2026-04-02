import { useState } from 'react';
import { MetroText } from '../primitives/MetroText';
import { Magnetic } from '../../components/core/magnetic';

export function FooterNav() {
  const [activeTab, setActiveTab] = useState<'logs' | 'status'>('status');

  return (
    <div className="flex flex-col gap-0.5 px-0 pb-2">
      <div className="flex gap-0.5">
        <button
          className="flex-1 py-2 text-center transition-colors"
          style={{
            background: activeTab === 'logs' ? '#78b4fe' : '#191a1a',
            color: activeTab === 'logs' ? '#00325b' : '#adaaaa',
          }}
          onClick={() => setActiveTab('logs')}
        >
          <MetroText variant="label" color="inherit">
            LOGS
          </MetroText>
        </button>
        <button
          className="flex-1 py-2 text-center transition-colors"
          style={{
            background: activeTab === 'status' ? '#78b4fe' : '#191a1a',
            color: activeTab === 'status' ? '#00325b' : '#adaaaa',
          }}
          onClick={() => setActiveTab('status')}
        >
          <MetroText variant="label" color="inherit">
            STATUS
          </MetroText>
        </button>
      </div>
      <Magnetic intensity={0.3} range={60}>
        <button
          className="w-full py-2.5 text-center transition-all duration-200 hover:brightness-125"
          style={{ background: '#78b4fe', color: '#00325b' }}
        >
          <MetroText variant="label" color="inherit">
            EXPORT_JSON
          </MetroText>
        </button>
      </Magnetic>
      <div className="text-center pt-1">
        <MetroText variant="micro" color="#484848">
          Memory Management Unit
        </MetroText>
      </div>
    </div>
  );
}
