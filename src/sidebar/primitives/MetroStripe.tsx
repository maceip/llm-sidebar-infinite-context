interface MetroStripeProps {
  color: string;
  label: string;
  textColor?: string;
}

export function MetroStripe({
  color,
  label,
  textColor = '#000',
}: MetroStripeProps) {
  return (
    <div
      className="flex-shrink-0 flex items-center justify-center"
      style={{ width: 48, background: color }}
    >
      <span
        className="text-[9px] font-black tracking-[0.15em] uppercase"
        style={{
          color: textColor,
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          letterSpacing: '0.15em',
        }}
      >
        {label}
      </span>
    </div>
  );
}
