import type { Signals } from '../scoring/config';
import type { Lead, LeadSource, Stage } from '../store/types';
import { buildEvents } from './buildEvents';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

interface Seed {
  name: string;
  emailUser: string;
  experienceId: string | null;
  stage: Stage;
  value: number;
  source: LeadSource;
  assignee: string | null;
  signals: Signals;
  lastSeenAgo: number;
  createdAgo: number;
}

/**
 * ~10 seeded CRM leads using the names from the Tripworks reference screenshot.
 * Signals are chosen so every fire tier is represented (scores in comments):
 * Cold ×2, Warm ×2, Interested ×2, Hot ×1, Very Hot ×2, Call Now ×1.
 * The demo visitor (Alex Rivera, 9.2 after the guided journey) must out-rank all of these.
 */
const SEEDS: Seed[] = [
  // 8.3 Very Hot
  { name: 'Megan Martinez', emailUser: 'megan', experienceId: 'luau', stage: 'new', value: 500, source: 'Instagram', assignee: null,
    signals: { visits: 5, cardClicks: 8, pagesVisited: 7, conversionClicks: 3, conversionExits: 1 }, lastSeenAgo: 38 * MIN, createdAgo: 2 * DAY },
  // 5.6 Warm (already converted)
  { name: 'dan Puckett', emailUser: 'james', experienceId: 'kayaking', stage: 'converted', value: 600, source: 'Website', assignee: 'Leilani K.',
    signals: { visits: 3, cardClicks: 5, pagesVisited: 5, conversionClicks: 3, conversionExits: 0 }, lastSeenAgo: 1 * DAY, createdAgo: 4 * DAY },
  // 7.6 Hot
  { name: 'Emily Dover', emailUser: 'emily', experienceId: 'hiking', stage: 'new', value: 250, source: 'Google Ads', assignee: null,
    signals: { visits: 4, cardClicks: 7, pagesVisited: 6, conversionClicks: 3, conversionExits: 1 }, lastSeenAgo: 3 * HOUR, createdAgo: 1 * DAY },
  // 6.2 Interested
  { name: 'Sandra Lynn', emailUser: 'sandra', experienceId: 'biking', stage: 'new', value: 540, source: 'Website', assignee: null,
    signals: { visits: 3, cardClicks: 6, pagesVisited: 6, conversionClicks: 2, conversionExits: 1 }, lastSeenAgo: 7 * HOUR, createdAgo: 3 * DAY },
  // 5.4 Warm
  { name: 'Kevin Smith', emailUser: 'kevinsmith', experienceId: 'fishing', stage: 'new', value: 350, source: 'Facebook', assignee: 'Leilani K.',
    signals: { visits: 4, cardClicks: 7, pagesVisited: 6, conversionClicks: 2, conversionExits: 0 }, lastSeenAgo: 11 * HOUR, createdAgo: 2 * DAY },
  // 1.6 Cold
  { name: 'Melanie Gannone', emailUser: 'melanie', experienceId: null, stage: 'contacted', value: 500, source: 'Referral', assignee: 'Noah P.',
    signals: { visits: 2, cardClicks: 3, pagesVisited: 3, conversionClicks: 0, conversionExits: 0 }, lastSeenAgo: 2 * DAY, createdAgo: 5 * DAY },
  // 9.0 Call Now
  { name: 'Jessica Jones', emailUser: 'jess', experienceId: 'kayaking', stage: 'pending', value: 450, source: 'Website', assignee: null,
    signals: { visits: 3, cardClicks: 10, pagesVisited: 6, conversionClicks: 3, conversionExits: 2 }, lastSeenAgo: 52 * MIN, createdAgo: 1 * DAY },
  // 8.6 Very Hot
  { name: 'Carlos Mendes', emailUser: 'carlos', experienceId: 'luau', stage: 'new', value: 780, source: 'Google Ads', assignee: null,
    signals: { visits: 5, cardClicks: 9, pagesVisited: 8, conversionClicks: 3, conversionExits: 1 }, lastSeenAgo: 1.5 * HOUR, createdAgo: 1 * DAY },
  // 6.0 Interested
  { name: 'Priya Shah', emailUser: 'priya', experienceId: 'hiking', stage: 'contacted', value: 300, source: 'Instagram', assignee: 'Noah P.',
    signals: { visits: 3, cardClicks: 5, pagesVisited: 6, conversionClicks: 2, conversionExits: 1 }, lastSeenAgo: 9 * HOUR, createdAgo: 3 * DAY },
  // 2.8 Cold
  { name: 'Tom Becker', emailUser: 'tom.becker', experienceId: 'biking', stage: 'new', value: 180, source: 'Facebook', assignee: null,
    signals: { visits: 2, cardClicks: 4, pagesVisited: 3, conversionClicks: 1, conversionExits: 0 }, lastSeenAgo: 3 * DAY, createdAgo: 6 * DAY },
];

const EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com'];

/** Builds fresh seeded leads (called on load and on Reset so timestamps stay relative to "now"). */
export function createSeedLeads(now = Date.now()): Lead[] {
  return SEEDS.map((s, i) => {
    const id = s.name.toLowerCase().replace(/\s+/g, '-');
    const events = buildEvents(id, s.signals, s.experienceId, s.lastSeenAgo, now);
    return {
      id,
      name: s.name,
      email: `${s.emailUser}@${EMAIL_DOMAINS[i % EMAIL_DOMAINS.length]}`,
      experienceId: s.experienceId,
      stage: s.stage,
      value: s.value,
      source: s.source,
      assignee: s.assignee,
      flagged: false,
      signals: s.signals,
      events,
      createdAt: now - s.createdAgo,
      lastActivityAt: now - s.lastSeenAgo,
    };
  });
}
