interface DotGridProps {
  cells: boolean[]; // true = active, false = inactive
  color: string;
  size?: number;
}

export function DotGrid({ cells, color, size = 6 }: DotGridProps) {
  const gap = 3;
  const totalWidth = cells.length * (size + gap) - gap;

  return (
    <svg width={totalWidth} height={size} viewBox={`0 0 ${totalWidth} ${size}`}>
      {cells.map((active, i) => (
        <rect
          key={i}
          x={i * (size + gap)}
          y={0}
          width={size}
          height={size}
          fill={active ? color : '#262626'}
          opacity={active ? 1 : 0.3}
        />
      ))}
    </svg>
  );
}
