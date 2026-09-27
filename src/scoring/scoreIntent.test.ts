import { describe, expect, it } from 'vitest';
import { SIGNAL_CONFIG, SIGNAL_ORDER } from './config';
import { EMPTY_SIGNALS, scoreIntent, tierFor } from './scoreIntent';

describe('scoreIntent', () => {
  it('scores a visitor with no activity as 0 / Cold', () => {
    const r = scoreIntent(EMPTY_SIGNALS);
    expect(r.score).toBe(0);
    expect(r.tier.id).toBe('cold');
    expect(r.tier.fires).toBe(0);
    expect(r.breakdown.every((b) => b.points === 0)).toBe(true);
  });

  it('scores a fully maxed visitor as 10 / Call Now', () => {
    const r = scoreIntent({ visits: 5, cardClicks: 10, pagesVisited: 8, conversionClicks: 3, conversionExits: 2 });
    expect(r.score).toBe(10);
    expect(r.tier.id).toBe('callNow');
    expect(r.tier.fires).toBe(5);
  });

  it('caps signals so extreme values cannot exceed 10', () => {
    const r = scoreIntent({ visits: 50, cardClicks: 999, pagesVisited: 80, conversionClicks: 30, conversionExits: 20 });
    expect(r.score).toBe(10);
    expect(r.breakdown.every((b) => b.normalized === 1)).toBe(true);
  });

  it('scores a single conversion exit alone as 1.3 (0.5 × 0.25 × 10, rounded)', () => {
    const r = scoreIntent({ ...EMPTY_SIGNALS, conversionExits: 1 });
    expect(r.score).toBe(1.3);
    expect(r.tier.id).toBe('cold');
  });

  it('scores a maxed conversion exit alone as 2.5 — exits alone never make a lead hot', () => {
    const r = scoreIntent({ ...EMPTY_SIGNALS, conversionExits: 2 });
    expect(r.score).toBe(2.5);
    expect(r.breakdown.find((b) => b.key === 'conversionExits')?.points).toBeCloseTo(2.5);
  });

  it('ignores negative inputs', () => {
    expect(scoreIntent({ ...EMPTY_SIGNALS, visits: -3 }).score).toBe(0);
  });

  it('breakdown points sum to the (unrounded) score and respect each max', () => {
    const r = scoreIntent({ visits: 3, cardClicks: 4, pagesVisited: 5, conversionClicks: 1, conversionExits: 1 });
    const sum = r.breakdown.reduce((s, b) => s + b.points, 0);
    expect(Math.abs(sum - r.score)).toBeLessThan(0.05);
    r.breakdown.forEach((b) => expect(b.points).toBeLessThanOrEqual(b.maxPoints));
  });

  it('weights sum to 1 so the scale is 0–10', () => {
    const total = SIGNAL_ORDER.reduce((s, k) => s + SIGNAL_CONFIG[k].weight, 0);
    expect(total).toBeCloseTo(1);
  });

  it('matches the guided-demo journey: 4.8 before, 9.2 after', () => {
    expect(scoreIntent({ visits: 4, cardClicks: 5, pagesVisited: 3, conversionClicks: 1, conversionExits: 1 }).score).toBe(4.8);
    expect(scoreIntent({ visits: 4, cardClicks: 8, pagesVisited: 7, conversionClicks: 4, conversionExits: 2 }).score).toBe(9.2);
  });
});

describe('tierFor', () => {
  it.each([
    [0, 'cold'],
    [4.9, 'cold'],
    [5.0, 'warm'],
    [5.9, 'warm'],
    [6.0, 'interested'],
    [7.0, 'hot'],
    [8.0, 'veryHot'],
    [8.9, 'veryHot'],
    [9.0, 'callNow'],
    [10, 'callNow'],
  ])('%s → %s', (score, id) => {
    expect(tierFor(score).id).toBe(id);
  });
});
