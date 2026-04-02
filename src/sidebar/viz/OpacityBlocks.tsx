interface OpacityBlocksProps {
  count?: number;
  color: string;
  height?: number;
}

export function OpacityBlocks({
  count = 6,
  color,
  height = 10,
}: OpacityBlocksProps) {
  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
    >
      {Array.from({ length: count }, (_, i) => {
        const blockWidth = 100 / count;
        return (
          <rect
            key={i}
            x={i * blockWidth}
            y={0}
            width={blockWidth - 1}
            height={height}
            fill={color}
            opacity={0.15 + (i / (count - 1)) * 0.85}
          />
        );
      })}
    </svg>
  );
}
