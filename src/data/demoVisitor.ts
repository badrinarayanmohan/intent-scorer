import type { Signals } from '../scoring/config';
import type { TrackedEvent } from '../store/types';

const MIN = 60_000;
const HOUR = 60 * MIN;

/**
 * The demo persona. Alex has already visited twice this week (stitched together by a
 * first-party cookie), so the session doesn't start from zero — just like a real
 * shopper who researches over several days before buying. Starting score: 4.8 (Cold).
 */
export const PERSONA = { name: 'Alex Rivera', email: 'alex.rivera@gmail.com' };

/** Signals carried in from prior sessions + the visit that is starting now. */
export const PRIOR_SIGNALS: Signals = {
  visits: 4, // 3 earlier sessions + this one
  cardClicks: 5,
  pagesVisited: 3,
  conversionClicks: 1,
  conversionExits: 1,
};

/** Pages already seen in earlier sessions (so revisiting them doesn't double count). */
export const PRIOR_PAGES = ['/', '/kayaking', '/faq'];

/** Earlier-session events shown dimmed at the top of the Live Signal Tracker. */
export function priorEvents(now = Date.now()): TrackedEvent[] {
  const base = now - 3 * 24 * HOUR;
  const rows: [number, TrackedEvent['kind'], string, string?][] = [
    [0, 'visit', 'First visit (via Instagram ad)'],
    [1 * MIN, 'page', 'Viewed: /', '/'],
    [2 * MIN, 'card', 'Clicked card: Kayaking', 'Kayaking'],
    [3 * MIN, 'page', 'Viewed: /kayaking', '/kayaking'],
    [26 * HOUR, 'visit', 'Return visit #2'],
    [26 * HOUR + 2 * MIN, 'card', 'Clicked card: Hawaiian Luau', 'Hawaiian Luau'],
    [26 * HOUR + 4 * MIN, 'page', 'Viewed: /faq', '/faq'],
    [48 * HOUR, 'visit', 'Return visit #3'],
    [48 * HOUR + 1 * MIN, 'card', 'Clicked card: Kayaking', 'Kayaking'],
    [48 * HOUR + 3 * MIN, 'card', 'Clicked card: Fishing', 'Fishing'],
    [48 * HOUR + 4 * MIN, 'card', 'Clicked card: Kayaking', 'Kayaking'],
    [48 * HOUR + 6 * MIN, 'conversion', 'Clicked Check Availability', 'Check Availability'],
    [48 * HOUR + 7 * MIN, 'exit', 'Left after checking availability', 'kayaking'],
  ];
  return rows.map(([offset, kind, label, detail], i) => ({ id: `prior-${i}`, kind, label, detail, at: base + offset, prior: true }));
}
