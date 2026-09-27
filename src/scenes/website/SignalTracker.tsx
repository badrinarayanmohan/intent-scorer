import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Radio, RotateCcw, UserCheck, UserX } from 'lucide-react';
import { useMemo } from 'react';
import { SIGNAL_CONFIG, SIGNAL_ORDER, type SignalKey } from '../../scoring/config';
import { scoreIntent } from '../../scoring/scoreIntent';
import { FireRating, IntentGauge } from '../../components/ui';
import { useDemoStore } from '../../store/useDemoStore';
import type { TrackedEvent } from '../../store/types';
import { EVENT_ICON } from '../../lib/eventIcons';


const SHORT_LABEL: Record<SignalKey, string> = {
  visits: 'visits',
  cardClicks: 'cardClicks',
  pagesVisited: 'pagesVisited',
  conversionClicks: 'conversionClicks',
  conversionExits: 'conversionExits',
};

/** "14:02:31" for the developer-style event log. */
function clock(at: number) {
  return new Date(at).toLocaleTimeString('en-GB', { hour12: false });
}

/** One row of the event stream, with the score delta that event caused. */
function EventRow({ e, prevScore }: { e: TrackedEvent; prevScore?: number }) {
  const delta = e.score !== undefined && prevScore !== undefined ? e.score - prevScore : 0;
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 16, backgroundColor: 'rgba(249,115,22,0.18)' }}
      animate={{ opacity: e.prior ? 0.45 : 1, x: 0, backgroundColor: 'rgba(249,115,22,0)' }}
      transition={{ duration: 0.5 }}
      className="flex items-start gap-2 rounded-md px-2 py-1.5 font-mono text-[11.5px] leading-snug"
    >
      <span className="w-4 shrink-0 text-center">{EVENT_ICON[e.kind]}</span>
      <span className="min-w-0 flex-1 break-words text-slate-200">{e.label}</span>
      {delta > 0.001 && <span className="shrink-0 font-semibold text-orange-400">+{delta.toFixed(1)}</span>}
      <span className="shrink-0 text-slate-500">{e.prior ? 'earlier' : clock(e.at)}</span>
    </motion.li>
  );
}

/**
 * Live Signal Tracker — a developer-overlay drawer on the right of the website.
 *
 * In production this data is invisible; in the demo it is the narrator. Viewers watch
 * each click land as an event, the five counters tick up and the gauge climb, which is
 * what makes the score feel earned rather than magic.
 */
export function SignalTracker() {
  const open = useDemoStore((s) => s.trackerOpen);
  const setOpen = useDemoStore((s) => s.setTrackerOpen);
  const visitor = useDemoStore((s) => s.visitor);
  const simulateReturnVisit = useDemoStore((s) => s.simulateReturnVisit);
  const intent = useMemo(() => scoreIntent(visitor.signals), [visitor.signals]);

  // Newest first; carry each event's predecessor score for the delta badge.
  const rows = useMemo(() => {
    const ev = visitor.events;
    return ev.map((e, i) => ({ e, prev: i > 0 ? ev[i - 1].score : undefined })).reverse();
  }, [visitor.events]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-11 shrink-0 flex-col items-center gap-3 rounded-l-2xl bg-[#0B1220] py-4 text-slate-300"
        title="Open Live Signal Tracker"
      >
        <Radio size={16} className="text-emerald-400" />
        <span className="font-mono text-[13px] font-bold text-white">{intent.score.toFixed(1)}</span>
        <span className="[writing-mode:vertical-rl] font-mono text-[11px] tracking-widest text-slate-400">SIGNAL TRACKER</span>
      </button>
    );
  }

  return (
    <aside className="flex w-[360px] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#0B1220] text-slate-200 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[13px] font-semibold text-white">Live Signal Tracker</span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">tripworks.js</span>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300" title="Collapse">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Identity */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 font-mono text-[11.5px]">
        {visitor.identity ? (
          <>
            <UserCheck size={14} className="text-emerald-400" />
            <span className="text-emerald-300">{visitor.identity.name}</span>
            <span className="truncate text-slate-500">{visitor.identity.email}</span>
          </>
        ) : (
          <>
            <UserX size={14} className="text-slate-500" />
            <span className="text-slate-400">anonymous</span>
            <span className="truncate text-slate-600">cookie tw_7f3a9c · 3 prior visits</span>
          </>
        )}
      </div>

      {/* Gauge */}
      <div className="flex items-center gap-4 px-4 pt-4">
        <IntentGauge score={intent.score} size={150} dark />
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-slate-500">Intent tier</div>
          <div className="mt-1 text-[18px] font-semibold text-white">{intent.tier.label}</div>
          <div className="mt-1 h-6">
            {intent.tier.fires > 0 ? (
              <FireRating tier={intent.tier} animateKey={intent.tier.id} size={17} />
            ) : (
              <span className="text-[12px] text-slate-500">no fire yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-1 gap-1.5 px-4 pb-3 pt-3">
        {SIGNAL_ORDER.map((k) => {
          const b = intent.breakdown.find((x) => x.key === k)!;
          return (
            <div key={k} className="flex items-center gap-2 font-mono text-[11.5px]" title={SIGNAL_CONFIG[k].why}>
              <span className="w-[118px] text-slate-400">{SHORT_LABEL[k]}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className={`h-full rounded-full ${k === 'conversionExits' ? 'bg-red-400' : k === 'conversionClicks' ? 'bg-orange-400' : 'bg-cyan-400'}`}
                  animate={{ width: `${b.normalized * 100}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={b.value}
                  initial={{ y: -8, opacity: 0, color: '#FB923C' }}
                  animate={{ y: 0, opacity: 1, color: '#FFFFFF' }}
                  transition={{ duration: 0.4 }}
                  className="w-6 text-right font-semibold"
                >
                  {b.value}
                </motion.span>
              </AnimatePresence>
              <span className="w-6 text-slate-600">/{b.cap}</span>
            </div>
          );
        })}
        <button
          type="button"
          data-demo="return-visit"
          onClick={simulateReturnVisit}
          className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2 text-[12px] font-medium text-slate-200 hover:bg-white/10"
        >
          <RotateCcw size={13} /> Simulate return visit
        </button>
      </div>

      {/* Event stream */}
      <div className="flex items-center justify-between border-t border-white/10 px-4 pb-1 pt-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Event stream</span>
        <span className="font-mono text-[11px] text-slate-500">{visitor.events.length} events</span>
      </div>
      <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
        <AnimatePresence initial={false}>
          {rows.map(({ e, prev }) => (
            <EventRow key={e.id} e={e} prevScore={prev} />
          ))}
        </AnimatePresence>
      </ul>
    </aside>
  );
}
