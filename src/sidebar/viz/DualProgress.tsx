import { ProgressFill } from '../primitives/ProgressFill';

interface DualProgressProps {
  topValue: number;
  bottomValue: number;
  topColor: string;
  bottomColor: string;
  topLabel?: string;
  bottomLabel?: string;
}

export function DualProgress({
  topValue,
  bottomValue,
  topColor,
  bottomColor,
  topLabel,
  bottomLabel,
}: DualProgressProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {topLabel && (
        <span
          className="text-[7px] tracking-[0.1em] uppercase"
          style={{ color: '#adaaaa' }}
        >
          {topLabel}
        </span>
      )}
      <ProgressFill value={topValue} color={topColor} height={4} />
      {bottomLabel && (
        <span
          className="text-[7px] tracking-[0.1em] uppercase"
          style={{ color: '#adaaaa' }}
        >
          {bottomLabel}
        </span>
      )}
      <ProgressFill value={bottomValue} color={bottomColor} height={4} />
    </div>
  );
}
