import { describe, expect, it } from 'vitest';
import { explainIntent } from './explain';
import type { TrackedEvent } from '../store/types';

const ev = (kind: TrackedEvent['kind'], detail?: string, at = 0): TrackedEvent => ({ id: Math.random().toString(), kind, label: '', detail, at });

describe('explainIntent', () => {
  it('summarises views, conversion clicks and a recent abandonment', () => {
    const now = 10 * 60_000;
    const events = [
      ev('visit'),
      ev('card', 'Kayaking'),
      ev('page', '/kayaking'),
      ev('page', '/kayaking/reviews'),
      ev('visit'),
      ev('conversion', 'Book Now'),
      ev('conversion', 'Book Now'),
      ev('exit', 'kayaking', now - 4 * 60_000),
    ];
    const { summary, advice } = explainIntent(events, 9, now);
    expect(summary).toBe('Viewed Kayaking 3 times across 2 visits, clicked Book Now twice, and abandoned checkout 4 min ago.');
    expect(advice).toMatch(/^Call now/);
  });

  it('handles an empty timeline', () => {
    expect(explainIntent([], 0).summary).toBe('No meaningful activity yet.');
  });
});
