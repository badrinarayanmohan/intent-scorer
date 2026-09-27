/**
 * Scoring configuration — the ONLY place weights, caps and tier thresholds live.
 *
 * Product note: sales leaders will want to tune these ("abandoned checkout should
 * count more for us"), so they are kept as plain data rather than buried in logic.
 * Weights must sum to 1.0 so the final score lands on a 0–10 scale.
 */

/** The five behavioural signals captured per visitor. */
export type SignalKey = 'visits' | 'cardClicks' | 'pagesVisited' | 'conversionClicks' | 'conversionExits';

export type Signals = Record<SignalKey, number>;

export interface SignalConfig {
  /** Value at which the signal is considered "maxed out" (normalised to 1). */
  cap: number;
  /** Share of the final score this signal can contribute (0–1). */
  weight: number;
  /** Human label shown in the CRM breakdown drawer and tracker. */
  label: string;
  /** One-line explanation for reps: why this signal matters. */
  why: string;
}

export const SIGNAL_CONFIG: Record<SignalKey, SignalConfig> = {
  visits: {
    cap: 5,
    weight: 0.15,
    label: 'Return visits',
    why: 'Returning visitors are actively considering a purchase',
  },
  cardClicks: {
    cap: 10,
    weight: 0.15,
    label: 'Experience clicks',
    why: 'Shows interest in specific products',
  },
  pagesVisited: {
    cap: 8,
    weight: 0.15,
    label: 'Pages researched',
    why: 'Depth of research',
  },
  conversionClicks: {
    cap: 3,
    weight: 0.3,
    label: 'Booking clicks',
    why: 'Strongest buying signal',
  },
  conversionExits: {
    cap: 2,
    weight: 0.25,
    label: 'Abandoned checkout',
    why: 'Abandoned intent — the most urgent call-back trigger',
  },
};

/** Display order for signals everywhere in the UI. */
export const SIGNAL_ORDER: SignalKey[] = [
  'visits',
  'cardClicks',
  'pagesVisited',
  'conversionClicks',
  'conversionExits',
];

export type TierId = 'cold' | 'warm' | 'interested' | 'hot' | 'veryHot' | 'callNow';

export interface TierConfig {
  id: TierId;
  /** Inclusive lower bound on the rounded 0–10 score. */
  min: number;
  label: string;
  fires: number;
}

/** Fire tiers, highest first so lookup can return the first match. */
export const TIERS: TierConfig[] = [
  { id: 'callNow', min: 9.0, label: 'Call Now', fires: 5 },
  { id: 'veryHot', min: 8.0, label: 'Very Hot', fires: 4 },
  { id: 'hot', min: 7.0, label: 'Hot', fires: 3 },
  { id: 'interested', min: 6.0, label: 'Interested', fires: 2 },
  { id: 'warm', min: 5.0, label: 'Warm', fires: 1 },
  { id: 'cold', min: 0, label: 'Cold', fires: 0 },
];

/** Scores at or above this get the pulsing "Call now" badge + phone button in the CRM. */
export const CALL_NOW_THRESHOLD = 8.0;

/** Scores at or above this count towards the "Hot+" filter. */
export const HOT_THRESHOLD = 7.0;
