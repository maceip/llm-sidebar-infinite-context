import type { ReactNode } from 'react';

type TextVariant = 'display' | 'metric' | 'label' | 'micro';

const VARIANT_CLASSES: Record<TextVariant, string> = {
  display: 'text-[11px] font-black tracking-[0.12em] uppercase text-white',
  metric: 'text-[20px] font-black tracking-[0.02em] text-white',
  label: 'text-[8px] font-bold tracking-[0.15em] uppercase',
  micro: 'text-[7px] font-normal tracking-[0.1em] uppercase',
};

interface MetroTextProps {
  variant?: TextVariant;
  color?: string;
  className?: string;
  children: ReactNode;
}

export function MetroText({
  variant = 'label',
  color,
  className = '',
  children,
}: MetroTextProps) {
  return (
    <span
      className={`${VARIANT_CLASSES[variant]} ${className}`}
      style={color ? { color } : undefined}
    >
      {children}
    </span>
  );
}
