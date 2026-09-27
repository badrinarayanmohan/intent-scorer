import { CALL_NOW_THRESHOLD, HOT_THRESHOLD } from '../../scoring/config';
import { scoreIntent, type IntentResult } from '../../scoring/scoreIntent';
import { getExperience } from '../../data/experiences';
import { STAGE_META } from '../../components/ui/StagePill';
import type { Filters, SortKey } from '../../store/useDemoStore';
import type { Lead } from '../../store/types';

export interface ScoredLead {
  lead: Lead;
  intent: IntentResult;
}

const HOUR = 3_600_000;

/** At Risk: payment pending for more than 48 h — the booking may slip away. */
export const isAtRisk = (l: Lead, now = Date.now()) => l.stage === 'pending' && now - l.createdAt > 48 * HOUR;

/** Needs Attention: a new, unassigned lead that nobody has touched for over 48 h. */
export const isNeedsAttention = (l: Lead, now = Date.now()) => l.stage === 'new' && !l.assignee && now - l.createdAt > 48 * HOUR;

/** Hot leads for the KPI card: call-now territory and not already booked. */
export const isHotNow = (s: ScoredLead) => s.intent.score >= CALL_NOW_THRESHOLD && s.lead.stage !== 'converted';

/**
 * Applies the filter bar and the current sort to the leads table.
 * Default sort is intent score descending — the whole point of the feature: the
 * hottest lead is always the first row a rep sees. `pinnedLastId` holds a freshly
 * captured lead at the bottom for a beat so its climb to #1 is visible.
 */
export function queryLeads(
  leads: Lead[],
  filters: Filters,
  sort: { key: SortKey; dir: 'asc' | 'desc' },
  pinnedLastId: string | null,
  now = Date.now(),
): ScoredLead[] {
  const q = filters.search.trim().toLowerCase();
  const rows = leads
    .map((lead) => ({ lead, intent: scoreIntent(lead.signals) }))
    .filter(({ lead, intent }) => {
      if (q && !lead.name.toLowerCase().includes(q) && !lead.email.toLowerCase().includes(q)) return false;
      if (filters.source && lead.source !== filters.source) return false;
      if (filters.experience && lead.experienceId !== filters.experience) return false;
      if (filters.intent === 'hot' && intent.score < HOT_THRESHOLD) return false;
      if (filters.intent === 'callNow' && intent.score < CALL_NOW_THRESHOLD) return false;
      if (filters.atRisk && !isAtRisk(lead, now)) return false;
      if (filters.needsAttention && !isNeedsAttention(lead, now)) return false;
      if (filters.unassigned && lead.assignee) return false;
      return true;
    });

  const dir = sort.dir === 'asc' ? 1 : -1;
  const cmp = (a: ScoredLead, b: ScoredLead): number => {
    switch (sort.key) {
      case 'intent':
        return (a.intent.score - b.intent.score) * dir || b.lead.lastActivityAt - a.lead.lastActivityAt;
      case 'customer':
        return a.lead.name.localeCompare(b.lead.name, undefined, { sensitivity: 'base' }) * dir;
      case 'experience':
        return (getExperience(a.lead.experienceId)?.name ?? '~').localeCompare(getExperience(b.lead.experienceId)?.name ?? '~') * dir;
      case 'stage':
        return (STAGE_META[a.lead.stage].order - STAGE_META[b.lead.stage].order) * dir;
      case 'value':
        return (a.lead.value - b.lead.value) * dir;
    }
  };

  const sorted = rows.sort(cmp);
  if (!pinnedLastId) return sorted;
  const pinned = sorted.filter((r) => r.lead.id === pinnedLastId);
  return [...sorted.filter((r) => r.lead.id !== pinnedLastId), ...pinned];
}
