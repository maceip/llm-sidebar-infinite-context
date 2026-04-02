import { MetroCard } from '../particles/MetroCard';
import { ProgressFill } from '../primitives/ProgressFill';
import { MODULE_COLORS } from '../tokens/colors';
import type { PipelineState } from '../hooks/usePipeline';

interface Props {
  data: PipelineState['system'];
}

export function SystemModule({ data }: Props) {
  const c = MODULE_COLORS.system;

  const statusColor =
    data.healthLabel === 'NOMINAL'
      ? '#82f76c'
      : data.healthLabel === 'OFFLINE'
        ? '#ff716c'
        : '#FFB900';

  return (
    <MetroCard
      stripeColor={c.bg}
      stripeTextColor={c.text}
      stripeLabel={c.label}
      metricLabel="STATUS"
      metricValue={data.healthLabel}
    >
      <div className="flex flex-col gap-1.5">
        <ProgressFill value={data.loadRatio} color={statusColor} height={3} />
        <div
          className="flex justify-between text-[7px] tracking-[0.08em] uppercase"
          style={{ color: '#adaaaa' }}
        >
          <span>{data.pinnedTabCount} pinned</span>
          <span>{data.hasApiKey ? 'KEY OK' : 'NO KEY'}</span>
          <span>{data.companionState ?? 'N/A'}</span>
        </div>
      </div>
    </MetroCard>
  );
}
