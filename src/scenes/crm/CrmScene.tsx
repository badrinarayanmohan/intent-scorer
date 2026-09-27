import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import {
  Bell,
  CalendarDays,
  ChartColumn,
  CircleCheck,
  Clock,
  DollarSign,
  Flame,
  Funnel,
  LayoutDashboard,
  MapPin,
  Megaphone,
  Percent,
  ReceiptText,
  Search,
  Settings,
  Ticket,
  TriangleAlert,
  User,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { FilterChip, KpiCard } from '../../components/ui';
import { EXPERIENCES } from '../../data/experiences';
import { money } from '../../lib/format';
import { later } from '../../lib/timers';
import { useDemoStore, type IntentFilter } from '../../store/useDemoStore';
import { IntentDrawer } from './IntentDrawer';
import { isAtRisk, isHotNow, isNeedsAttention, queryLeads } from './leadQuery';
import { LeadRow, LeadsHeader } from './LeadsTable';

/** Number that counts up/down smoothly — used so the "Hot Leads Right Now" KPI visibly ticks. */
function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => Math.round(v).toString());
  useEffect(() => {
    const c = animate(mv, value, { duration: 0.8, ease: 'easeOut' });
    return () => c.stop();
  }, [value, mv]);
  return <motion.span>{text}</motion.span>;
}

/** Slim Tripworks app sidebar so the CRM reads as the real product, not a mock table. */
function Sidebar() {
  const items = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: CalendarDays, label: 'Calendar' },
    { icon: Ticket, label: 'Bookings' },
    { icon: Users, label: 'Leads', active: true },
    { icon: Megaphone, label: 'Marketing' },
    { icon: ChartColumn, label: 'Reports' },
  ];
  return (
    <aside className="flex w-[72px] shrink-0 flex-col items-center border-r border-tw-border bg-white py-5">
      <div className="grid h-10 w-10 place-items-center rounded-tile bg-tw-ink text-[17px] font-bold text-white">T</div>
      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {items.map(({ icon: Icon, label, active }) => (
          <span
            key={label}
            title={label}
            className={`grid h-11 w-11 place-items-center rounded-tile ${active ? 'bg-[#F3EDFE] text-tw-purple' : 'text-tw-faint hover:bg-tw-wash'}`}
          >
            <Icon size={20} />
          </span>
        ))}
      </nav>
      <span className="grid h-11 w-11 place-items-center rounded-tile text-tw-faint">
        <Settings size={20} />
      </span>
    </aside>
  );
}

/**
 * Scene 2: the Tripworks CRM leads page, restyled from the reference screenshot with
 * two native-looking additions — the "Hot Leads Right Now" KPI and the Intent column
 * (default sort). Also orchestrates the capture moment: new row enters at the bottom,
 * climbs to #1, glows, and the KPI ticks up.
 */
export function CrmScene() {
  const leads = useDemoStore((s) => s.leads);
  const filters = useDemoStore((s) => s.filters);
  const sort = useDemoStore((s) => s.sort);
  const setFilter = useDemoStore((s) => s.setFilter);
  const promotingLeadId = useDemoStore((s) => s.promotingLeadId);
  const highlightLeadId = useDemoStore((s) => s.highlightLeadId);
  const unread = useDemoStore((s) => s.unreadNotifications);
  const clearNotifications = useDemoStore((s) => s.clearNotifications);
  const scroller = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => queryLeads(leads, filters, sort, promotingLeadId), [leads, filters, sort, promotingLeadId]);
  const all = useMemo(() => queryLeads(leads, { ...filters, search: '', source: null, experience: null, intent: 'all', atRisk: false, needsAttention: false, unassigned: false }, sort, null), [leads, filters, sort]);

  // The capture choreography: show the new row at the bottom, then release it so the
  // intent sort pulls it to #1 while the page scrolls up with it.
  useEffect(() => {
    if (!promotingLeadId) return;
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight });
    later(() => {
      useDemoStore.setState({ promotingLeadId: null });
      scroller.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1300);
    later(() => useDemoStore.setState({ highlightLeadId: null }), 6500);
  }, [promotingLeadId]);

  // KPI numbers. The first three mirror the reference screenshot; converted demo
  // bookings add to them so free play stays consistent.
  const demoConverted = leads.filter((l) => l.id.startsWith('lead-') && l.stage === 'converted');
  const revenue = 7500 + demoConverted.reduce((s, l) => s + l.value, 0);
  const converted = 14 + demoConverted.length;
  const awaiting = 1890 + leads.filter((l) => l.stage === 'pending').reduce((s, l) => s + l.value, 0);
  // While the new lead is still pinned at the bottom it hasn't "arrived" yet, so the KPI ticks up on release.
  const hotNow = all.filter((r) => isHotNow(r) && r.lead.id !== promotingLeadId).length;

  const counts = {
    atRisk: leads.filter((l) => isAtRisk(l)).length,
    needsAttention: leads.filter((l) => isNeedsAttention(l)).length,
    unassigned: leads.filter((l) => !l.assignee).length,
  };

  const intentOptions: { value: IntentFilter; label: string }[] = [
    { value: 'all', label: 'All intent' },
    { value: 'hot', label: '🔥🔥🔥 Hot+ (7.0+)' },
    { value: 'callNow', label: '📞 Call now (8.0+)' },
  ];

  return (
    <div className="flex h-full bg-tw-wash font-sans">
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Page header */}
        <header className="flex h-[68px] shrink-0 items-center justify-between px-8">
          <div>
            <h1 className="text-[22px] font-bold tracking-[-0.01em] text-tw-ink">Leads</h1>
            <div className="text-[13px] text-tw-muted">Maui Wild Adventures · sorted by intent</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clearNotifications}
              data-demo="crm-bell"
              className="relative grid h-10 w-10 place-items-center rounded-ctl border border-tw-border bg-white text-tw-muted"
              title="Notifications"
            >
              <Bell size={18} />
              <AnimatePresence>
                {unread > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-tw-flame px-1 text-[10.5px] font-bold text-white ring-2 ring-tw-wash"
                  >
                    {unread}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <div className="flex items-center gap-2 rounded-ctl border border-tw-border bg-white py-1.5 pl-1.5 pr-3">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-tw-ink text-[11px] font-bold text-white">YO</span>
              <span className="text-[13px] font-medium text-tw-body">You · Sales</span>
            </div>
          </div>
        </header>

        {/* White content panel, scrolls independently */}
        <motion.div layoutScroll ref={scroller} data-crm-scroll className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 min-[1400px]:px-6">
          <div className="rounded-t-[20px] bg-white px-5 pb-2 pt-6 min-[1400px]:px-6 shadow-card ring-1 ring-tw-border">
            {/* KPI row */}
            <div className="grid grid-cols-5 gap-3 min-[1400px]:gap-4">
              <KpiCard tone="green" icon={<DollarSign size={22} />} value={money(revenue)} valueClassName="text-tw-greenText" label="Revenue This Week" />
              <KpiCard tone="blue" icon={<CircleCheck size={22} />} value={converted} label="Converted This Week" />
              <KpiCard tone="yellow" icon={<Percent size={22} />} value="72.5%" label="Conversion Rate" />
              <KpiCard tone="cyan" icon={<ReceiptText size={22} />} value={money(awaiting)} label="Awaiting Payment" />
              <KpiCard
                tone="orange"
                icon={<Flame size={22} />}
                value={
                  <span className="flex items-center gap-2" data-demo="kpi-hot">
                    <AnimatedNumber value={hotNow} />
                    {highlightLeadId && !promotingLeadId && (
                      <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-md bg-tile-orange px-1.5 py-0.5 text-[12px] font-bold text-tw-flame">
                        +1
                      </motion.span>
                    )}
                  </span>
                }
                label="Hot Leads Right Now"
                hint="Leads scoring 8.0+ that haven't booked yet"
              />
            </div>

            {/* Filter bar */}
            <div className="mt-6 flex items-center gap-2.5 border-b border-tw-line pb-4">
              <label className="flex h-10 w-[230px] shrink-0 items-center gap-2.5 rounded-ctl bg-tw-input px-3.5">
                <Search size={17} className="text-tw-faint" />
                <input
                  value={filters.search}
                  onChange={(e) => setFilter({ search: e.target.value })}
                  placeholder="Search leads..."
                  className="w-full bg-transparent text-[14px] text-tw-ink outline-none placeholder:text-tw-faint"
                />
              </label>
              <FilterChip
                icon={<Flame size={15} />}
                label="Intent"
                accent
                demoId="filter-intent"
                options={intentOptions}
                value={filters.intent === 'all' ? null : filters.intent}
                onSelect={(v) => setFilter({ intent: (v ?? 'all') as IntentFilter })}
              />
              <FilterChip
                icon={<Funnel size={15} />}
                label="Source"
                options={[{ value: null, label: 'All sources' }, ...['Website', 'Instagram', 'Google Ads', 'Facebook', 'Referral'].map((s) => ({ value: s, label: s }))]}
                value={filters.source}
                onSelect={(v) => setFilter({ source: v })}
              />
              <FilterChip
                icon={<MapPin size={15} />}
                label="Experience"
                options={[{ value: null, label: 'All experiences' }, ...EXPERIENCES.map((e) => ({ value: e.id, label: e.name }))]}
                value={filters.experience}
                onSelect={(v) => setFilter({ experience: v })}
              />
              <FilterChip icon={<TriangleAlert size={15} />} label="At Risk" count={counts.atRisk} active={filters.atRisk} onToggle={() => setFilter({ atRisk: !filters.atRisk })} />
              <FilterChip
                icon={<Clock size={15} />}
                label="Needs Attention"
                count={counts.needsAttention}
                active={filters.needsAttention}
                onToggle={() => setFilter({ needsAttention: !filters.needsAttention })}
              />
              <FilterChip icon={<User size={15} />} label="Unassigned" count={counts.unassigned} active={filters.unassigned} onToggle={() => setFilter({ unassigned: !filters.unassigned })} />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-b-[20px] bg-white shadow-card ring-1 ring-tw-border">
            <LeadsHeader />
            <div className="relative">
              {rows.map((row) => (
                <LeadRow
                  key={row.lead.id}
                  row={row}
                  highlighted={row.lead.id === highlightLeadId}
                  fresh={row.lead.id === highlightLeadId}
                  pinned={row.lead.id === promotingLeadId}
                />
              ))}
              {rows.length === 0 && <div className="py-16 text-center text-[14px] text-tw-muted">No leads match these filters.</div>}
            </div>
            <div className="flex items-center justify-between px-6 py-4 text-[13px] text-tw-muted">
              <span>
                Showing {rows.length} of {leads.length} leads
              </span>
              <span>Sorted by {sort.key === 'intent' ? 'intent score' : sort.key} · {sort.dir === 'desc' ? 'high → low' : 'low → high'}</span>
            </div>
          </div>
        </motion.div>

        <IntentDrawer />
      </div>
    </div>
  );
}
