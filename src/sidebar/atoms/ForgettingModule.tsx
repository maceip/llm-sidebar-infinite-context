import { MetroCard } from '../particles/MetroCard';
import { FadingSquares } from '../viz/FadingSquares';
import { MODULE_COLORS } from '../tokens/colors';
import type { PipelineState } from '../hooks/usePipeline';

interface Props {
  data: PipelineState['forgetting'];
}

export function ForgettingModule({ data }: Props) {
  const c = MODULE_COLORS.forgetting;
  return (
    <MetroCard
      stripeColor={c.bg}
      stripeTextColor={c.text}
      stripeLabel={c.label}
      metricLabel="DECAY"
      metricValue={data.decayLabel}
    >
      <FadingSquares count={5} color={c.bg} />
    </MetroCard>
  );
}
