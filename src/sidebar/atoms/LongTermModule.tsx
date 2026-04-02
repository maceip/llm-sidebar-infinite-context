import { MetroCard } from '../particles/MetroCard';
import { DualProgress } from '../viz/DualProgress';
import { MODULE_COLORS } from '../tokens/colors';
import type { PipelineState } from '../hooks/usePipeline';

interface Props {
  data: PipelineState['longTerm'];
}

export function LongTermModule({ data }: Props) {
  const c = MODULE_COLORS['long-term'];
  return (
    <MetroCard
      stripeColor={c.bg}
      stripeTextColor={c.text}
      stripeLabel={c.label}
      metricLabel="INDEX"
      metricValue={`${data.episodeCount} / ${data.maxEpisodes}`}
    >
      <DualProgress
        topValue={data.turnRatio}
        bottomValue={data.summaryRatio}
        topColor={c.text}
        bottomColor={c.bg}
        topLabel="TURNS"
        bottomLabel="SUMMARIES"
      />
    </MetroCard>
  );
}
