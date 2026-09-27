import { SIGNAL_CONFIG, SIGNAL_ORDER, TIERS, type SignalKey, type Signals, type TierConfig } from './config';

/** How much one signal contributed to the final score — powers the CRM breakdown bars. */
export interface SignalContribution {
  key: SignalKey;
  label: string;
  value: number;
  cap: number;
  weight: number;
  /** min(value / cap, 1) */
  normalized: number;
  /** Points out of 10 this signal added (normalized × weight × 10). */
  points: number;
  /** The most points this signal could ever add (weight × 10). */
  maxPoints: number;
}

export interface IntentResult {
  /** 0–10, rounded to one decimal place. */
  score: number;
  tier: TierConfig;
  breakdown: SignalContribution[];
}

export const EMPTY_SIGNALS: Signals = {
  visits: 0,
  cardClicks: 0,
  pagesVisited: 0,
  conversionClicks: 0,
  conversionExits: 0,
};

/** Round to one decimal. The epsilon stops float noise (e.g. 7.249999…) flipping a tier. */
export function roundScore(raw: number): number {
  return Math.round(raw * 10 + 1e-9) / 10;
}

/** Map a rounded score to its fire tier (Cold → Call Now). */
export function tierFor(score: number): TierConfig {
  return TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1];
}

/**
 * The Intent Scorer.
 *
 * Pure and deterministic on purpose: the same signals always give the same score, so
 * reps can trust it and the breakdown drawer can explain it line by line. No black box:
 *   1. normalise each signal to 0–1 with a cap:   min(value / cap, 1)
 *   2. weighted sum of the normalised signals, × 10
 *   3. round to one decimal, then look up the fire tier
 */
export function scoreIntent(signals: Signals): IntentResult {
  const breakdown = SIGNAL_ORDER.map((key): SignalContribution => {
    const { cap, weight, label } = SIGNAL_CONFIG[key];
    const value = Math.max(0, signals[key] ?? 0);
    const normalized = Math.min(value / cap, 1);
    return {
      key,
      label,
      value,
      cap,
      weight,
      normalized,
      points: normalized * weight * 10,
      maxPoints: weight * 10,
    };
  });

  const raw = breakdown.reduce((sum, c) => sum + c.points, 0);
  const score = Math.min(10, roundScore(raw));
  return { score, tier: tierFor(score), breakdown };
}
