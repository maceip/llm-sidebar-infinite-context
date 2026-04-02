import { MetroCard } from '../particles/MetroCard';
import { DotGrid } from '../viz/DotGrid';
import { MODULE_COLORS } from '../tokens/colors';
import type { PipelineState } from '../hooks/usePipeline';

interface Props {
  data: PipelineState['retriever'];
}

export function RetrieverModule({ data }: Props) {
  const c = MODULE_COLORS.retriever;
  return (
    <MetroCard
      stripeColor={c.bg}
      stripeTextColor={c.text}
      stripeLabel={c.label}
      metricLabel="LATENCY"
      metricValue={data.latencyLabel}
    >
      <DotGrid cells={data.dotCells} color={c.bg} />
    </MetroCard>
  );
}
