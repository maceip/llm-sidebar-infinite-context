import type { ReactNode } from 'react';

type TonalLevel = 'base' | 'low' | 'mid' | 'high' | 'highest' | 'bright';

const TONAL_MAP: Record<TonalLevel, string> = {
  base: '#0e0e0e',
  low: '#131313',
  mid: '#191a1a',
  high: '#1f2020',
  highest: '#262626',
  bright: '#2c2c2c',
};

interface MetroSurfaceProps {
  level?: TonalLevel;
  className?: string;
  children: ReactNode;
}

export function MetroSurface({
  level = 'low',
  className = '',
  children,
}: MetroSurfaceProps) {
  return (
    <div className={className} style={{ background: TONAL_MAP[level] }}>
      {children}
    </div>
  );
}
