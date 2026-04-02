interface BarChartProps {
  data: number[]; // 0-1 values
  color: string;
  height?: number;
}

export function BarChart({ data, color, height = 24 }: BarChartProps) {
  const barCount = data.length || 1;
  const barWidth = 100 / barCount;
  const gap = 1;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
    >
      {data.map((v, i) => {
        const h = Math.max(1, v * height);
        return (
          <rect
            key={i}
            x={i * barWidth + gap / 2}
            y={height - h}
            width={Math.max(0, barWidth - gap)}
            height={h}
            fill={color}
            opacity={0.4 + v * 0.6}
          />
        );
      })}
    </svg>
  );
}
