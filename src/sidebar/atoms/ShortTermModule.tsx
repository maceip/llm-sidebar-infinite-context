import { MetroCard } from '../particles/MetroCard';
import { BarChart } from '../viz/BarChart';
import { MODULE_COLORS } from '../tokens/colors';
import type { PipelineState } from '../hooks/usePipeline';

interface Props {
  data: PipelineState['shortTerm'];
}

export function ShortTermModule({ data }: Props) {
  const c = MODULE_COLORS['short-term'];
  return (
    <MetroCard
      stripeColor={c.bg}
      stripeTextColor={c.text}
      stripeLabel={c.label}
      metricLabel="RETENTION"
      metricValue={data.retentionLabel}
    >
      <BarChart data={data.barData} color={c.bg} />
    </MetroCard>
  );
}
