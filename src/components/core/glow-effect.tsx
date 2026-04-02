'use client';
import { cn } from '../../lib/utils';
import { motion, type Transition } from 'motion/react';

export type GlowEffectProps = {
  className?: string;
  style?: React.CSSProperties;
  colors?: string[];
  mode?:
    | 'rotate'
    | 'pulse'
    | 'breathe'
    | 'colorShift'
    | 'flowHorizontal'
    | 'static';
  blur?:
    | number
    | 'softest'
    | 'soft'
    | 'medium'
    | 'strong'
    | 'stronger'
    | 'strongest'
    | 'none';
  transition?: Transition;
  scale?: number;
  duration?: number;
};

export function GlowEffect({
  className,
  style,
  colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F'],
  mode = 'rotate',
  blur = 'medium',
  transition,
  scale = 1,
  duration = 5,
}: GlowEffectProps) {
  const BASE_TRANSITION = {
    repeat: Infinity,
    duration,
    ease: 'linear' as const,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const animations: Record<string, any> = {
    rotate: {
      background: [
        `conic-gradient(from 0deg at 50% 50%, ${colors.join(', ')})`,
        `conic-gradient(from 360deg at 50% 50%, ${colors.join(', ')})`,
      ],
      transition: { ...(transition ?? BASE_TRANSITION) },
    },
    pulse: {
      background: colors.map(
        (c) => `radial-gradient(circle at 50% 50%, ${c} 0%, transparent 100%)`,
      ),
      scale: [1 * scale, 1.1 * scale, 1 * scale],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        ...(transition ?? {
          ...BASE_TRANSITION,
          repeatType: 'mirror' as const,
        }),
      },
    },
    breathe: {
      background: colors.map(
        (c) => `radial-gradient(circle at 50% 50%, ${c} 0%, transparent 100%)`,
      ),
      scale: [1 * scale, 1.05 * scale, 1 * scale],
      transition: {
        ...(transition ?? {
          ...BASE_TRANSITION,
          repeatType: 'mirror' as const,
        }),
      },
    },
    static: {
      background: `linear-gradient(to right, ${colors.join(', ')})`,
    },
  };

  const blurPresets: Record<string, string> = {
    softest: 'blur-xs',
    soft: 'blur-sm',
    medium: 'blur-md',
    strong: 'blur-lg',
    stronger: 'blur-xl',
    strongest: 'blur-2xl',
    none: 'blur-none',
  };

  const blurClass =
    typeof blur === 'number' ? `blur-[${blur}px]` : blurPresets[blur];

  return (
    <motion.div
      style={
        {
          ...style,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        } as React.CSSProperties
      }
      animate={animations[mode] || animations.static}
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full scale-[var(--scale)] transform-gpu',
        blurClass,
        className,
      )}
    />
  );
}
