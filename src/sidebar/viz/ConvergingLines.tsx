interface ConvergingLinesProps {
  widths: number[]; // 0-1 values, should decrease
  color: string;
  height?: number;
}

export function ConvergingLines({
  widths,
  color,
  height = 20,
}: ConvergingLinesProps) {
  const lineHeight = 3;
  const gap =
    (height - widths.length * lineHeight) / Math.max(1, widths.length - 1);

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
    >
      {widths.map((w, i) => (
        <rect
          key={i}
          x={0}
          y={i * (lineHeight + gap)}
          width={Math.max(2, w * 100)}
          height={lineHeight}
          fill={color}
          opacity={0.5 + w * 0.5}
        />
      ))}
    </svg>
  );
}
