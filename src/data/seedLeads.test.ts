import { describe, expect, it } from 'vitest';
import { scoreIntent } from '../scoring/scoreIntent';
import { TIERS } from '../scoring/config';
import { createSeedLeads } from './seedLeads';
import { PRIOR_SIGNALS } from './demoVisitor';

describe('seed data', () => {
  const leads = createSeedLeads(0);
  const scores = leads.map((l) => scoreIntent(l.signals));

  it('represents every fire tier', () => {
    const tiers = new Set(scores.map((s) => s.tier.id));
    TIERS.forEach((t) => expect(tiers.has(t.id)).toBe(true));
  });

  it('keeps every seeded lead below the demo visitor’s final 9.2', () => {
    scores.forEach((s) => expect(s.score).toBeLessThan(9.2));
  });

  it('starts the demo visitor Cold at 4.8', () => {
    expect(scoreIntent(PRIOR_SIGNALS).score).toBe(4.8);
  });

  it('builds timelines whose event counts match the signals', () => {
    leads.forEach((l) => {
      const count = (k: string) => l.events.filter((e) => e.kind === k).length;
      expect(count('visit')).toBe(l.signals.visits);
      expect(count('card')).toBe(l.signals.cardClicks);
      expect(count('conversion')).toBe(l.signals.conversionClicks);
      expect(count('exit')).toBe(l.signals.conversionExits);
    });
  });
});
