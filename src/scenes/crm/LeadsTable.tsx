import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, ChevronsUpDown, Ellipsis, Flag, Phone } from 'lucide-react';
import { Avatar, FireRating, StagePill } from '../../components/ui';
import { getExperience } from '../../data/experiences';
import { money } from '../../lib/format';
import { CALL_NOW_THRESHOLD } from '../../scoring/config';
import { useDemoStore, type SortKey } from '../../store/useDemoStore';
import type { ScoredLead } from './leadQuery';

/** Column template shared by the header and every row so they always line up. */
export const GRID = 'grid grid-cols-[56px_minmax(205px,1.5fr)_minmax(150px,1fr)_minmax(250px,1.3fr)_minmax(170px,0.95fr)_84px_108px] items-center';

/** Screenshot-style checkbox: 20px, rounded, soft grey border. */
function Checkbox() {
  return <span className="block h-5 w-5 rounded-[5px] border-[1.5px] border-[#C9CED8] bg-white" />;
}

/** Sortable uppercase column header with the faint up/down glyph from the screenshot. */
function HeaderCell({ label, k, align = 'left', isNew }: { label: string; k?: SortKey; align?: 'left' | 'right'; isNew?: boolean }) {
  const sort = useDemoStore((s) => s.sort);
  const setSort = useDemoStore((s) => s.setSort);
  const active = k && sort.key === k;
  const Icon = !active ? ChevronsUpDown : sort.dir === 'desc' ? ChevronDown : ChevronUp;
  return (
    <button
      type="button"
      disabled={!k}
      onClick={() => k && setSort(k)}
      data-demo={k ? `sort-${k}` : undefined}
      className={`flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] ${active ? 'text-tw-ink' : 'text-[#5A6072]'} ${
        align === 'right' ? 'justify-end' : ''
      }`}
    >
      {label}
      {isNew && <span className="rounded bg-tile-orange px-1 py-px text-[9.5px] font-bold tracking-wider text-tw-flame">NEW</span>}
      {k && <Icon size={12} className={active ? 'text-tw-ink' : 'text-tw-faint'} />}
    </button>
  );
}

/** Table header band. */
export function LeadsHeader() {
  return (
    <div className={`${GRID} h-12 border-b border-tw-border bg-tw-head`}>
      <div className="pl-6">
        <Checkbox />
      </div>
      <HeaderCell label="Customer" k="customer" />
      <HeaderCell label="Experience" k="experience" />
      <HeaderCell label="Intent" k="intent" isNew />
      <HeaderCell label="Stage" k="stage" />
      <HeaderCell label="Value" k="value" align="right" />
      <div />
    </div>
  );
}

/**
 * The new Intent cell: score, fire emojis and tier label, plus a pulsing "Call now"
 * badge at 8.0+. Clicking it opens the breakdown drawer so the score is never a
 * black box to the rep.
 */
function IntentCell({ row, fresh, pinned }: { row: ScoredLead; fresh: boolean; pinned: boolean }) {
  const openDrawer = useDemoStore((s) => s.openDrawer);
  const { score, tier } = row.intent;
  const callNow = score >= CALL_NOW_THRESHOLD;
  return (
    <button
      type="button"
      data-demo={`intent-${row.lead.id}`}
      onClick={() => openDrawer(row.lead.id)}
      className="group -ml-2 flex items-center gap-3 rounded-ctl px-2 py-1.5 text-left hover:bg-tw-wash"
      title="See why"
    >
      <span className={`w-8 text-[15px] font-bold tabular-nums ${tier.fires === 0 ? 'text-tw-muted' : 'text-tw-ink'}`}>{score.toFixed(1)}</span>
      <span className="flex flex-col gap-1">
        <span className="flex h-[18px] items-center">
          {pinned ? (
            <span className="animate-pulse text-[12px] font-medium text-tw-faint">Scoring…</span>
          ) : (
            <FireRating tier={tier} animateKey={fresh ? `${row.lead.id}-${score}` : undefined} delay={fresh ? 0.5 : 0} />
          )}
        </span>
        {tier.fires > 0 && !pinned && <span className="text-[12px] font-medium leading-none text-tw-muted">{tier.label}</span>}
      </span>
      {callNow && !pinned && (
        <span className="ml-auto inline-flex shrink-0 animate-pulseRing items-center gap-1 whitespace-nowrap rounded-full bg-tw-red px-2 py-[3px] text-[10.5px] font-bold uppercase tracking-wide text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          Call now
        </span>
      )}
    </button>
  );
}

/** One lead row. `layout` lets Framer Motion animate re-ordering (the climb to #1). */
export function LeadRow({ row, highlighted, fresh, pinned }: { row: ScoredLead; highlighted: boolean; fresh: boolean; pinned: boolean }) {
  const updateLead = useDemoStore((s) => s.updateLead);
  const pushToast = useDemoStore((s) => s.pushToast);
  const { lead, intent } = row;
  const exp = getExperience(lead.experienceId);
  const [user, domain] = lead.email.split('@');
  const callNow = intent.score >= CALL_NOW_THRESHOLD;

  return (
    <motion.div
      layout="position"
      data-lead-row={lead.id}
      initial={fresh ? { opacity: 0, y: 24 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ layout: { type: 'spring', stiffness: 70, damping: 16, mass: 1 }, opacity: { duration: 0.4 } }}
      className={`${GRID} relative h-[72px] border-b border-tw-line bg-white transition-[background-color,box-shadow] duration-700 ${
        highlighted ? 'z-10 !bg-[#FFF7ED] shadow-glow' : ''
      }`}
    >
      <div className="pl-6">
        <Checkbox />
      </div>

      {/* Customer */}
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={lead.name} size={40} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => updateLead(lead.id, { flagged: !lead.flagged })}
              className={lead.flagged ? 'text-tw-red' : 'text-[#D0D4DC] hover:text-tw-muted'}
              title="Flag"
            >
              <Flag size={13} className={lead.flagged ? 'fill-tw-red' : ''} />
            </button>
            <span className="truncate text-[15px] font-semibold text-tw-ink">{lead.name}</span>
          </div>
          <div className="mt-0.5 flex items-center text-[13.5px] text-tw-muted">
            {user}@<span className="select-none blur-[3.5px]">{domain}</span>
          </div>
        </div>
      </div>

      {/* Experience */}
      <div className="flex min-w-0 items-center gap-3">
        {exp ? (
          <>
            <img src={exp.image} alt="" className="h-9 w-9 shrink-0 rounded-md object-cover" />
            <span className="truncate text-[14.5px] text-tw-body">{exp.name}</span>
          </>
        ) : (
          <span className="text-[14.5px] text-tw-body">Not specified</span>
        )}
      </div>

      {/* Intent (new) */}
      <div className="pr-4">
        <IntentCell row={row} fresh={fresh} pinned={pinned} />
      </div>

      {/* Stage */}
      <div>
        <StagePill stage={lead.stage} />
      </div>

      {/* Value */}
      <div className="text-right text-[15px] text-tw-ink">{money(lead.value)}</div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1.5 pl-4 pr-5">
        {callNow && lead.stage !== 'converted' && (
          <button
            type="button"
            onClick={() => {
              updateLead(lead.id, { stage: 'contacted', assignee: lead.assignee ?? 'You' });
              pushToast({ tone: 'success', title: `Calling ${lead.name}…`, body: 'Stage moved to Contacted (demo).' });
            }}
            className="grid h-8 w-8 place-items-center rounded-full bg-tw-flame text-white shadow-sm shadow-orange-300 hover:brightness-105"
            title="Call now"
          >
            <Phone size={14} />
          </button>
        )}
        <button type="button" className="grid h-8 w-8 place-items-center rounded-full text-tw-faint hover:bg-tw-wash" title="More">
          <Ellipsis size={16} />
        </button>
      </div>
    </motion.div>
  );
}
