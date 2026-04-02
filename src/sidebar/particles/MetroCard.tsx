import type { ReactNode } from 'react';
import { MetroStripe } from '../primitives/MetroStripe';
import { MetroSurface } from '../primitives/MetroSurface';
import { MetroText } from '../primitives/MetroText';
import { Tilt } from '../../components/core/tilt';
import { Spotlight } from '../../components/core/spotlight';
import { GlowEffect } from '../../components/core/glow-effect';

interface MetroCardProps {
  stripeColor: string;
  stripeTextColor?: string;
  stripeLabel: string;
  metricLabel: string;
  metricValue: string;
  glowColors?: string[];
  children?: ReactNode;
  onClick?: () => void;
}

export function MetroCard({
  stripeColor,
  stripeTextColor,
  stripeLabel,
  metricLabel,
  metricValue,
  glowColors,
  children,
  onClick,
}: MetroCardProps) {
  const defaultGlow = [stripeColor, `${stripeColor}66`, '#0e0e0e'];

  return (
    <Tilt
      rotationFactor={6}
      isRevese
      springOptions={{ stiffness: 26.7, damping: 4.1, mass: 0.2 }}
      className="group relative cursor-pointer"
    >
      {/* Glow behind the card */}
      <GlowEffect
        colors={glowColors ?? defaultGlow}
        mode="breathe"
        blur="medium"
        scale={1.02}
        duration={4}
        className="opacity-0 transition-opacity duration-300 group-hover:opacity-40"
      />

      {/* Card surface */}
      <div className="relative" onClick={onClick}>
        <MetroSurface
          level="low"
          className="flex min-h-[72px] transition-colors duration-200 group-hover:!bg-[#191a1a]"
        >
          {/* Spotlight follows cursor inside card */}
          <Spotlight
            className="z-10 from-white/20 via-white/5 to-transparent blur-2xl"
            size={180}
            springOptions={{ stiffness: 26.7, damping: 4.1, mass: 0.2 }}
          />

          <MetroStripe
            color={stripeColor}
            label={stripeLabel}
            textColor={stripeTextColor}
          />
          <div className="flex-1 flex flex-col justify-between p-3 gap-1.5 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <MetroText variant="label" color="#adaaaa">
                {metricLabel}
              </MetroText>
              <MetroText variant="metric">{metricValue}</MetroText>
            </div>
            {children && <div className="mt-auto">{children}</div>}
          </div>
        </MetroSurface>
      </div>
    </Tilt>
  );
}
