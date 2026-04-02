interface ProgressFillProps {
  value: number; // 0-1
  color: string;
  height?: number;
  bgColor?: string;
}

export function ProgressFill({
  value,
  color,
  height = 3,
  bgColor = '#262626',
}: ProgressFillProps) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div className="w-full" style={{ height, background: bgColor }}>
      <div
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          background: color,
          transition: 'width 0.6s ease',
        }}
      />
    </div>
  );
}
