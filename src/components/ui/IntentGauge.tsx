import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

/** Colour ramp for the gauge arc: grey → amber → orange → red as intent rises. */
export function intentColor(score: number): string {
  if (score >= 9) return '#DC2626';
  if (score >= 8) return '#EA580C';
  if (score >= 7) return '#F97316';
  if (score >= 6) return '#F59E0B';
  if (score >= 5) return '#FBBF24';
  return '#A6ACBA';
}

/**
 * Semicircular 0–10 intent gauge. The number and arc spring-animate on every change so
 * viewers *see* each behaviour move the score (Live Signal Tracker + CRM drawer).
 */
export function IntentGauge({ score, size = 180, dark = false }: { score: number; size?: number; dark?: boolean }) {
  const spring = useSpring(score, { stiffness: 90, damping: 18 });
  useEffect(() => spring.set(score), [score, spring]);
  const text = useTransform(spring, (v) => v.toFixed(1));
  const r = 80;
  const circ = Math.PI * r;
  const dash = useTransform(spring, (v) => `${(Math.min(v, 10) / 10) * circ} ${circ}`);
  const color = intentColor(score);

  return (
    <div className="relative" style={{ width: size, height: size * 0.62 }}>
      <svg viewBox="0 0 200 118" width={size} height={size * 0.59}>
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke={dark ? '#1E293B' : '#EEF0F4'} strokeWidth="16" strokeLinecap="round" />
        <motion.path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          style={{ strokeDasharray: dash }}
          animate={{ stroke: color }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <motion.div className={`text-[34px] font-bold leading-none tracking-tight ${dark ? 'text-white' : 'text-tw-ink'}`}>{text}</motion.div>
        <div className={`mt-1 text-[11px] font-medium uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-tw-muted'}`}>of 10</div>
      </div>
    </div>
  );
}
