import { usePipeline } from './hooks/usePipeline';
import { PanelHeader } from './particles/PanelHeader';
import { FooterNav } from './particles/FooterNav';
import { ShortTermModule } from './atoms/ShortTermModule';
import { LongTermModule } from './atoms/LongTermModule';
import { RetrieverModule } from './atoms/RetrieverModule';
import { ConsolidatorModule } from './atoms/ConsolidatorModule';
import { ForgettingModule } from './atoms/ForgettingModule';
import { AssemblerModule } from './atoms/AssemblerModule';
import { SystemModule } from './atoms/SystemModule';

export function App() {
  const pipeline = usePipeline();

  return (
    <div
      className="flex flex-col h-screen w-full"
      style={{ background: '#0e0e0e' }}
    >
      <PanelHeader />
      <div className="flex-1 overflow-y-auto flex flex-col gap-0.5 px-0">
        <ShortTermModule data={pipeline.shortTerm} />
        <LongTermModule data={pipeline.longTerm} />
        <RetrieverModule data={pipeline.retriever} />
        <ConsolidatorModule data={pipeline.consolidator} />
        <ForgettingModule data={pipeline.forgetting} />
        <AssemblerModule data={pipeline.assembler} />
        <SystemModule data={pipeline.system} />
      </div>
      <FooterNav />
    </div>
  );
}
