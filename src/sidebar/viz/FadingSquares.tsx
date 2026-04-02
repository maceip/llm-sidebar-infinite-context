interface FadingSquaresProps {
  count?: number;
  color: string;
  size?: number;
}

export function FadingSquares({
  count = 5,
  color,
  size = 10,
}: FadingSquaresProps) {
  const gap = 4;
  const totalWidth = count * (size + gap) - gap;

  return (
    <svg width={totalWidth} height={size} viewBox={`0 0 ${totalWidth} ${size}`}>
      {Array.from({ length: count }, (_, i) => (
        <rect
          key={i}
          x={i * (size + gap)}
          y={0}
          width={size}
          height={size}
          fill={color}
          opacity={1 - (i / count) * 0.8}
        />
      ))}
    </svg>
  );
}
