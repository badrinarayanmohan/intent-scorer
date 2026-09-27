import { EXPERIENCES } from '../data/experiences';
import { ago, ordinal } from '../lib/format';
import type { TrackedEvent } from '../store/types';
import { CALL_NOW_THRESHOLD } from './config';

const times = (n: number) => (n === 1 ? 'once' : n === 2 ? 'twice' : `${n} times`);

/**
 * Turns a lead's raw event timeline into the plain-English "Why call now" line a rep
 * can read in two seconds before dialling, e.g.
 * "Viewed Kayaking 6 times across 4 visits, clicked Check Availability twice and
 *  Book Now once, and abandoned checkout 4 min ago."
 */
export function explainIntent(events: TrackedEvent[], score: number, now = Date.now()): { summary: string; advice: string } {
  const parts: string[] = [];

  // Most-viewed experience (detail pages + card clicks both count as "viewed").
  const views = EXPERIENCES.map((exp) => ({
    exp,
    n: events.filter(
      (e) => (e.kind === 'page' && (e.detail === `/${exp.id}` || e.detail === `/${exp.id}/reviews`)) || (e.kind === 'card' && e.detail === exp.name),
    ).length,
  })).sort((a, b) => b.n - a.n);
  const visits = events.filter((e) => e.kind === 'visit').length;
  if (views[0] && views[0].n > 0) {
    parts.push(`Viewed ${views[0].exp.name} ${times(views[0].n)}${visits > 1 ? ` across ${visits} visits` : ''}`);
  } else if (visits > 0) {
    parts.push(`Browsed the site on ${visits} visit${visits > 1 ? 's' : ''}`);
  }

  // Conversion clicks, grouped by button.
  const conv = new Map<string, number>();
  events.filter((e) => e.kind === 'conversion').forEach((e) => conv.set(e.detail ?? 'Book Now', (conv.get(e.detail ?? 'Book Now') ?? 0) + 1));
  if (conv.size) {
    const bits = [...conv.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${times(n)}`);
    parts.push(`clicked ${bits.length > 1 ? `${bits.slice(0, -1).join(', ')} and ${bits[bits.length - 1]}` : bits[0]}`);
  }

  // Most recent abandonment.
  const exits = events.filter((e) => e.kind === 'exit');
  const lastExit = exits[exits.length - 1];
  if (lastExit) parts.push(`abandoned checkout ${ago(lastExit.at, now)}${exits.length > 1 ? ` (${ordinal(exits.length)} time)` : ''}`);

  const summary = parts.length
    ? `${parts.length > 1 ? `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}` : parts[0]}.`
    : 'No meaningful activity yet.';

  const advice =
    score >= CALL_NOW_THRESHOLD
      ? lastExit
        ? 'Call now — abandoners are most recoverable in the first few minutes, while the tab is still fresh in their mind.'
        : 'Call now — this lead is showing strong buying intent.'
      : score >= 6
        ? 'Worth a same-day follow-up email with availability for their favourite experience.'
        : 'Nurture: add to the newsletter sequence rather than calling.';

  return { summary, advice };
}
