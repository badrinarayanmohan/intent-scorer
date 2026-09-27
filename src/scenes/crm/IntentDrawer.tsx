import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Phone, UserPlus, X } from 'lucide-react';
import { useMemo } from 'react';
import { Avatar, FireRating, IntentGauge, StagePill } from '../../components/ui';
import { getExperience } from '../../data/experiences';
import { ago, money } from '../../lib/format';
import { CALL_NOW_THRESHOLD, SIGNAL_CONFIG } from '../../scoring/config';
import { explainIntent } from '../../scoring/explain';
import { scoreIntent } from '../../scoring/scoreIntent';
import { useDemoStore } from '../../store/useDemoStore';
import { EVENT_ICON } from '../../lib/eventIcons';

/**
 * Intent breakdown drawer. Answers the rep's first question — "why is this lead hot?" —
 * with the gauge, one bar per signal showing its contribution, a plain-English summary
 * and the raw event timeline captured on the website. Trust in the score is what gets
 * reps to actually follow the ordering.
 */
export function IntentDrawer() {
  const leadId = useDemoStore((s) => s.drawerLeadId);
  const lead = useDemoStore((s) => s.leads.find((l) => l.id === leadId));
  const close = useDemoStore((s) => s.openDrawer);
  const updateLead = useDemoStore((s) => s.updateLead);
  const pushToast = useDemoStore((s) => s.pushToast);

  const intent = useMemo(() => (lead ? scoreIntent(lead.signals) : null), [lead]);
  const why = useMemo(() => (lead && intent ? explainIntent(lead.events, intent.score) : null), [lead, intent]);

  return (
    <AnimatePresence>
      {lead && intent && why && (
        <>
          <motion.div
            key="scrim"
            className="absolute inset-0 z-40 bg-slate-900/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => close(null)}
          />
          <motion.aside
            key="drawer"
            data-demo="intent-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="absolute bottom-0 right-0 top-0 z-50 flex w-[480px] flex-col border-l border-tw-border bg-white shadow-drawer"
          >
            {/* Header */}
            <div className="flex items-start gap-3 border-b border-tw-border px-6 py-5">
              <Avatar name={lead.name} size={44} />
              <div className="min-w-0 flex-1">
                <div className="text-[18px] font-bold text-tw-ink">{lead.name}</div>
                <div className="text-[13px] text-tw-muted">
                  {lead.email} · {getExperience(lead.experienceId)?.name ?? 'Not specified'} · {money(lead.value)}
                </div>
                <div className="mt-2">
                  <StagePill stage={lead.stage} />
                </div>
              </div>
              <button type="button" onClick={() => close(null)} className="grid h-8 w-8 place-items-center rounded-full text-tw-muted hover:bg-tw-wash">
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {/* Score */}
              <div className="flex items-center gap-5 rounded-card border border-tw-border p-4">
                <IntentGauge score={intent.score} size={160} />
                <div>
                  <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-tw-muted">Intent score</div>
                  <div className="mt-1 text-[20px] font-bold text-tw-ink">{intent.tier.label}</div>
                  <div className="mt-1">
                    <FireRating tier={intent.tier} animateKey={lead.id} size={18} />
                  </div>
                  {intent.score >= CALL_NOW_THRESHOLD && (
                    <span className="mt-2 inline-flex animate-pulseRing items-center gap-1 rounded-full bg-tw-red px-2 py-[3px] text-[10.5px] font-bold uppercase tracking-wide text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" /> Call now
                    </span>
                  )}
                </div>
              </div>

              {/* Why call now */}
              <div className={`mt-4 rounded-card p-4 ${intent.score >= CALL_NOW_THRESHOLD ? 'bg-[#FFF7ED] ring-1 ring-orange-100' : 'bg-tw-wash'}`}>
                <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-tw-flame">
                  {intent.score >= CALL_NOW_THRESHOLD ? '⚡ Why call now' : 'What they did'}
                </div>
                <p data-demo="why-summary" className="mt-1.5 text-[14.5px] leading-relaxed text-tw-ink">
                  {why.summary}
                </p>
                <p className="mt-1.5 text-[13px] text-tw-muted">{why.advice}</p>
              </div>

              {/* Breakdown */}
              <div className="mt-6">
                <div className="flex items-baseline justify-between">
                  <div className="text-[14px] font-semibold text-tw-ink">Score breakdown</div>
                  <div className="text-[12px] text-tw-muted">points added / max</div>
                </div>
                <div className="mt-3 space-y-3">
                  {intent.breakdown.map((b, i) => (
                    <div key={b.key} title={SIGNAL_CONFIG[b.key].why}>
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-tw-body">
                          {b.label} <span className="text-tw-faint">· {b.value} of {b.cap}</span>
                        </span>
                        <span className="tabular-nums text-tw-muted">
                          <span className="font-semibold text-tw-ink">+{b.points.toFixed(2)}</span> / {b.maxPoints.toFixed(1)}
                        </span>
                      </div>
                      {/* Track width = this signal's max share of the 10-point scale */}
                      <div className="mt-1.5 h-2.5 rounded-full bg-tw-input" style={{ width: `${b.weight * 100 * 3.2}%`, maxWidth: '100%' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: b.key === 'conversionExits' ? '#EF4444' : b.key === 'conversionClicks' ? '#F97316' : '#A259F7' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${b.normalized * 100}%` }}
                          transition={{ delay: 0.15 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-[12px] text-tw-muted">
                  Score = Σ min(value ÷ cap, 1) × weight × 10. Weights: booking clicks 30%, abandoned checkout 25%, visits / clicks / pages 15% each.
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-6">
                <div className="text-[14px] font-semibold text-tw-ink">Website activity</div>
                <ol className="relative mt-3 space-y-3 border-l border-tw-border pl-5">
                  {[...lead.events].reverse().slice(0, 30).map((e) => (
                    <li key={e.id} className="relative">
                      <span className="absolute -left-[31px] top-0 grid h-5 w-5 place-items-center rounded-full bg-white text-[11px] ring-1 ring-tw-border">
                        {EVENT_ICON[e.kind]}
                      </span>
                      <div className={`text-[13.5px] ${e.kind === 'exit' || e.kind === 'conversion' ? 'font-semibold text-tw-ink' : 'text-tw-body'}`}>{e.label}</div>
                      <div className="text-[12px] text-tw-faint">{ago(e.at)}</div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 border-t border-tw-border px-6 py-4">
              <button
                type="button"
                data-demo="drawer-call"
                onClick={() => {
                  updateLead(lead.id, { stage: lead.stage === 'converted' ? 'converted' : 'contacted', assignee: lead.assignee ?? 'You' });
                  pushToast({ tone: 'success', title: `📞 Calling ${lead.name}…`, body: 'Stage moved to Contacted (demo).' });
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-ctl bg-tw-flame py-2.5 text-[14px] font-semibold text-white shadow-sm shadow-orange-200 hover:brightness-105"
              >
                <Phone size={15} /> Call now
              </button>
              <button
                type="button"
                onClick={() => {
                  updateLead(lead.id, { assignee: 'You' });
                  pushToast({ tone: 'info', title: 'Assigned to you', body: lead.name });
                }}
                className="flex items-center gap-2 rounded-ctl border border-tw-border px-3.5 py-2.5 text-[14px] font-medium text-tw-body hover:bg-tw-wash"
              >
                <UserPlus size={15} /> {lead.assignee === 'You' ? 'Assigned' : 'Assign to me'}
              </button>
              <button
                type="button"
                onClick={() => pushToast({ tone: 'info', title: 'Follow-up sent', body: `Availability email sent to ${lead.email}` })}
                className="flex items-center gap-2 rounded-ctl border border-tw-border px-3.5 py-2.5 text-[14px] font-medium text-tw-body hover:bg-tw-wash"
              >
                <Mail size={15} /> Send follow-up
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
