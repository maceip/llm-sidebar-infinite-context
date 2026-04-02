import { MetroCard } from '../particles/MetroCard';
import { OpacityBlocks } from '../viz/OpacityBlocks';
import { MODULE_COLORS } from '../tokens/colors';
import type { PipelineState } from '../hooks/usePipeline';

interface Props {
  data: PipelineState['assembler'];
}

export function AssemblerModule({ data }: Props) {
  const c = MODULE_COLORS.assembler;
  return (
    <MetroCard
      stripeColor={c.bg}
      stripeTextColor={c.text}
      stripeLabel={c.label}
      metricLabel="CONSTRUCTS"
      metricValue={data.constructLabel}
    >
      <OpacityBlocks count={6} color={c.bg} />
    </MetroCard>
  );
}
