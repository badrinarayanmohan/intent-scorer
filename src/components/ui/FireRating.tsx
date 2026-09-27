import { motion } from 'framer-motion';
import type { TierConfig } from '../../scoring/config';

/**
 * Fire emojis for an intent tier (0–5 🔥). Cold renders a grey "Cold" pill instead so
 * a rep's eye skips it. When `animateKey` changes the flames pop in one by one — this
 * is the "this lead just got hot" moment in the CRM.
 */
export function FireRating({
  tier,
  animateKey,
  size = 15,
  delay = 0,
}: {
  tier: TierConfig;
  animateKey?: string | number;
  size?: number;
  delay?: number;
}) {
  if (tier.fires === 0) {
    return (
      <span className="inline-flex h-6 items-center rounded-md bg-tw-input px-2 text-[12px] font-semibold text-tw-muted">Cold</span>
    );
  }
  return (
    <span key={animateKey} className="inline-flex items-center leading-none" style={{ fontSize: size }} aria-label={`${tier.fires} of 5 fires`}>
      {Array.from({ length: tier.fires }).map((_, i) => (
        <motion.span
          key={i}
          initial={animateKey !== undefined ? { scale: 0, opacity: 0, y: 4 } : false}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: delay + i * 0.18, type: 'spring', stiffness: 520, damping: 14 }}
          className="-ml-[1px] inline-block first:ml-0"
        >
          🔥
        </motion.span>
      ))}
    </span>
  );
}
