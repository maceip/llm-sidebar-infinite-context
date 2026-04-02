import { MetroCard } from '../particles/MetroCard';
import { ConvergingLines } from '../viz/ConvergingLines';
import { MODULE_COLORS } from '../tokens/colors';
import type { PipelineState } from '../hooks/usePipeline';

interface Props {
  data: PipelineState['consolidator'];
}

export function ConsolidatorModule({ data }: Props) {
  const c = MODULE_COLORS.consolidator;
  return (
    <MetroCard
      stripeColor={c.bg}
      stripeTextColor={c.text}
      stripeLabel={c.label}
      metricLabel="MERGE RATE"
      metricValue={data.mergeRate.toFixed(2)}
    >
      <ConvergingLines widths={data.lineWidths} color={c.bg} />
    </MetroCard>
  );
}
