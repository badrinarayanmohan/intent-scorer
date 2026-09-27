import type { Signals } from '../scoring/config';
import type { TrackedEvent } from '../store/types';
import { getExperience } from './experiences';

const MIN = 60_000;
const HOUR = 60 * MIN;

/**
 * Synthesises a believable browsing history that exactly matches a set of signals.
 * Seeded CRM leads need a timeline for the breakdown drawer, and generating it from
 * the signals guarantees the timeline and the score never disagree.
 *
 * @param lastSeenAgo  how long ago (ms) the most recent event happened
 */
export function buildEvents(idPrefix: string, signals: Signals, experienceId: string | null, lastSeenAgo: number, now = Date.now()): TrackedEvent[] {
  const exp = getExperience(experienceId);
  const focus = exp ?? getExperience('luau')!;
  const pagePool = ['/', `/${focus.id}`, `/${focus.id}/reviews`, '/experiences', '/faq', '/kayaking', '/hiking', `/checkout/${focus.id}`];
  const cardPool = [focus.name, focus.name, 'Kayaking', focus.name, 'Hiking', 'Hawaiian Luau', focus.name, 'Fishing', 'Biking', focus.name];
  const convPool = ['Check Availability', 'Book Now', 'Select Date'];

  // Build the story in session order: each visit has some pages/cards, conversions come late.
  const sessions = Math.max(1, signals.visits);
  const out: Omit<TrackedEvent, 'at' | 'id'>[][] = Array.from({ length: sessions }, () => []);
  for (let s = 0; s < sessions; s++) out[s].push({ kind: 'visit', label: s === 0 ? 'First visit' : `Return visit #${s + 1}`, prior: true });

  const uniquePages = [...new Set(pagePool)].slice(0, signals.pagesVisited);
  uniquePages.forEach((p, i) => out[i % sessions].push({ kind: 'page', label: `Viewed: ${p}`, detail: p, prior: true }));
  for (let i = 0; i < signals.cardClicks; i++) {
    const name = cardPool[i % cardPool.length];
    out[i % sessions].push({ kind: 'card', label: `Clicked card: ${name}`, detail: name, prior: true });
  }
  for (let i = 0; i < signals.conversionClicks; i++) {
    const s = sessions - 1 - (i % sessions);
    out[s].push({ kind: 'conversion', label: `Clicked ${convPool[i % convPool.length]}`, detail: convPool[i % convPool.length], prior: true });
  }
  for (let i = 0; i < signals.conversionExits; i++) {
    const s = sessions - 1 - i;
    out[Math.max(0, s)].push({ kind: 'exit', label: 'Exited at checkout', detail: focus.id, prior: true });
  }

  // Lay sessions out backwards from lastSeenAgo, ~1 day apart, events ~1–3 min apart.
  const flat: TrackedEvent[] = [];
  let n = 0;
  out.forEach((session, sIdx) => {
    const sessionEnd = now - lastSeenAgo - (sessions - 1 - sIdx) * 22 * HOUR;
    const start = sessionEnd - (session.length - 1) * 2 * MIN;
    session.forEach((e, i) => flat.push({ ...e, id: `${idPrefix}-${n++}`, at: start + i * 2 * MIN }));
  });
  return flat;
}
