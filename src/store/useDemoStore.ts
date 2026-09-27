import { create } from 'zustand';
import type { Signals } from '../scoring/config';
import { CALL_NOW_THRESHOLD } from '../scoring/config';
import { scoreIntent } from '../scoring/scoreIntent';
import { createSeedLeads } from '../data/seedLeads';
import { PERSONA, PRIOR_PAGES, PRIOR_SIGNALS, priorEvents } from '../data/demoVisitor';
import { getExperience } from '../data/experiences';
import { clearTimers, later } from '../lib/timers';
import type { EventKind, Lead, Stage, TrackedEvent } from './types';

/**
 * The single shared store for the whole demo.
 *
 * Both scenes read from here: the website writes visitor events, the scorer turns
 * them into signals, and the CRM reads the resulting leads. Keeping one store is what
 * makes the "same visitor shows up in the CRM" moment real rather than faked.
 */

export type Scene = 'website' | 'crm';

export type ConversionKind = 'Book Now' | 'Check Availability' | 'Select Date';

/** Everything we know about the anonymous (then identified) website visitor. */
export interface VisitorSession {
  signals: Signals;
  events: TrackedEvent[];
  /** Unique paths seen — `pagesVisited` is its length. */
  pages: string[];
  identity: { name: string; email: string } | null;
  /** A conversion button was clicked since the last exit → leaving now counts as abandonment. */
  convSinceExit: boolean;
  /** The "browser tab" is closed (after Exit / Close tab) until a return visit. */
  tabClosed: boolean;
  checkoutExperienceId: string | null;
}

export type SortKey = 'intent' | 'customer' | 'experience' | 'stage' | 'value';
export type IntentFilter = 'all' | 'hot' | 'callNow';

export interface Filters {
  search: string;
  source: string | null;
  experience: string | null;
  intent: IntentFilter;
  atRisk: boolean;
  needsAttention: boolean;
  unassigned: boolean;
}

export interface Toast {
  id: number;
  title: string;
  body?: string;
  tone: 'flame' | 'info' | 'success';
  /** Optional CTA; 'viewCrm' jumps to the CRM scene. */
  action?: { label: string; kind: 'viewCrm' };
}

export interface CursorState {
  x: number;
  y: number;
  visible: boolean;
  clicking: boolean;
}

export interface DemoState {
  running: boolean;
  caption: string;
  step: number;
  total: number;
  cursor: CursorState;
}

interface Store {
  scene: Scene;
  route: string;
  visitor: VisitorSession;
  checkoutForm: { name: string; email: string; guests: number; date: string | null };
  availabilityOpen: boolean;
  trackerOpen: boolean;

  leads: Lead[];
  /** Newly captured lead that is temporarily pinned to the bottom before animating to its rank. */
  promotingLeadId: string | null;
  highlightLeadId: string | null;
  unreadNotifications: number;
  drawerLeadId: string | null;
  sort: { key: SortKey; dir: 'asc' | 'desc' };
  filters: Filters;
  toasts: Toast[];
  demo: DemoState;

  // Website actions
  navigate: (path: string) => void;
  clickCard: (experienceId: string) => void;
  conversionClick: (kind: ConversionKind, experienceId: string) => void;
  setCheckoutField: (patch: Partial<Store['checkoutForm']>) => void;
  identify: (name: string, email: string) => void;
  exitSite: () => void;
  completeBooking: () => void;
  simulateReturnVisit: () => void;
  setTrackerOpen: (open: boolean) => void;

  // Scene + CRM actions
  setScene: (scene: Scene) => void;
  setSort: (key: SortKey) => void;
  setFilter: (patch: Partial<Filters>) => void;
  openDrawer: (leadId: string | null) => void;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  clearNotifications: () => void;
  pushToast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;

  // Demo control
  setDemo: (patch: Partial<DemoState>) => void;
  setCursor: (patch: Partial<CursorState>) => void;
  reset: () => void;
}

let eventSeq = 0;
let toastSeq = 0;

/** Makes a tracked event stamped with the current time. */
function makeEvent(kind: EventKind, label: string, detail?: string): TrackedEvent {
  return { id: `ev-${++eventSeq}`, kind, label, detail, at: Date.now() };
}

/** Fresh visitor session: Alex Rivera with prior-session history stitched in. */
function initialVisitor(): VisitorSession {
  const now = Date.now();
  return {
    signals: { ...PRIOR_SIGNALS },
    events: [...priorEvents(now - 60_000), { ...makeEvent('visit', 'Return visit #4 — session started'), at: now, score: scoreIntent(PRIOR_SIGNALS).score }],
    pages: [...PRIOR_PAGES],
    identity: null,
    convSinceExit: false,
    tabClosed: false,
    checkoutExperienceId: null,
  };
}

const initialFilters: Filters = {
  search: '',
  source: null,
  experience: null,
  intent: 'all',
  atRisk: false,
  needsAttention: false,
  unassigned: false,
};

const initialDemo: DemoState = {
  running: false,
  caption: '',
  step: 0,
  total: 0,
  cursor: { x: -100, y: -100, visible: false, clicking: false },
};

/** Stable lead id derived from the email so repeat exits update the same CRM row. */
const leadIdFor = (email: string) => `lead-${email.toLowerCase()}`;

function initialState() {
  return {
    scene: 'website' as Scene,
    route: '/',
    visitor: initialVisitor(),
    checkoutForm: { name: PERSONA.name, email: PERSONA.email, guests: 2, date: null },
    availabilityOpen: false,
    trackerOpen: true,
    leads: createSeedLeads(),
    promotingLeadId: null,
    highlightLeadId: null,
    unreadNotifications: 0,
    drawerLeadId: null,
    sort: { key: 'intent' as SortKey, dir: 'desc' as const },
    filters: { ...initialFilters },
    toasts: [] as Toast[],
  };
}

export const useDemoStore = create<Store>((set, get) => {
  /**
   * The one funnel every website behaviour goes through: append the event, bump the
   * signal, and — if the visitor is already a known lead — keep their CRM row in sync.
   */
  const track = (event: TrackedEvent, bump: Partial<Signals> = {}, extra: Partial<VisitorSession> = {}) => {
    set((s) => {
      const signals = { ...s.visitor.signals };
      (Object.keys(bump) as (keyof Signals)[]).forEach((k) => (signals[k] += bump[k] ?? 0));
      const scored = { ...event, score: scoreIntent(signals).score };
      const visitor: VisitorSession = { ...s.visitor, ...extra, signals, events: [...s.visitor.events, scored] };
      const leads = visitor.identity
        ? s.leads.map((l) =>
            l.id === leadIdFor(visitor.identity!.email)
              ? { ...l, signals: { ...signals }, events: visitor.events, lastActivityAt: event.at }
              : l,
          )
        : s.leads;
      return { visitor, leads };
    });
  };

  /** Create or refresh the visitor's CRM lead, then run the capture → CRM transition. */
  const captureLead = (stage: Stage, reason: 'exit' | 'booked') => {
    const { visitor, checkoutForm, leads } = get();
    if (!visitor.identity) return null;
    const id = leadIdFor(visitor.identity.email);
    const exp = getExperience(visitor.checkoutExperienceId);
    const now = Date.now();
    const existing = leads.find((l) => l.id === id);
    const lead: Lead = {
      id,
      name: visitor.identity.name,
      email: visitor.identity.email,
      experienceId: exp?.id ?? null,
      stage,
      value: (exp?.price ?? 0) * Math.max(1, checkoutForm.guests),
      source: 'Website',
      assignee: existing?.assignee ?? null,
      flagged: existing?.flagged ?? false,
      signals: { ...visitor.signals },
      events: visitor.events,
      createdAt: existing?.createdAt ?? now,
      lastActivityAt: now,
    };
    set((s) => ({
      leads: existing ? s.leads.map((l) => (l.id === id ? lead : l)) : [...s.leads, lead],
      promotingLeadId: id,
      highlightLeadId: id,
      unreadNotifications: s.unreadNotifications + 1,
      drawerLeadId: null,
    }));

    const { score, tier } = scoreIntent(lead.signals);
    if (reason === 'exit') {
      get().pushToast({
        tone: 'flame',
        title: score >= CALL_NOW_THRESHOLD ? 'New high-intent lead captured' : 'New lead captured',
        body: `${lead.name} · ${score.toFixed(1)} ${'🔥'.repeat(tier.fires)} ${tier.label}`,
        action: { label: 'View in CRM →', kind: 'viewCrm' },
      });
      // Auto-transition so the viewer sees the payoff without having to click.
      later(() => get().setScene('crm'), 2200);
    } else {
      get().pushToast({ tone: 'success', title: 'Booking confirmed 🎉', body: `${lead.name} converted — ${exp?.name}` });
    }
    return id;
  };

  return {
    ...initialState(),
    demo: { ...initialDemo },

    navigate: (path) => {
      const s = get();
      if (s.visitor.tabClosed) return;
      const isNew = !s.visitor.pages.includes(path);
      track(makeEvent('page', `Viewed: ${path}`, path), isNew ? { pagesVisited: 1 } : {}, {
        pages: isNew ? [...s.visitor.pages, path] : s.visitor.pages,
      });
      set({ route: path, availabilityOpen: false });
    },

    clickCard: (experienceId) => {
      const exp = getExperience(experienceId);
      if (!exp) return;
      track(makeEvent('card', `Clicked card: ${exp.name}`, exp.name), { cardClicks: 1 });
      get().navigate(`/${exp.id}`);
    },

    conversionClick: (kind, experienceId) => {
      track(makeEvent('conversion', `Clicked ${kind}`, kind), { conversionClicks: 1 }, {
        convSinceExit: true,
        checkoutExperienceId: experienceId,
      });
      if (kind === 'Book Now') get().navigate(`/checkout/${experienceId}`);
      if (kind === 'Check Availability') set({ availabilityOpen: true });
    },

    setCheckoutField: (patch) => set((s) => ({ checkoutForm: { ...s.checkoutForm, ...patch } })),

    identify: (name, email) => {
      const cur = get().visitor.identity;
      if (cur && cur.email === email && cur.name === name) return;
      track(makeEvent('identify', `Identified: ${name} <${email}>`, email), {}, { identity: { name, email } });
    },

    exitSite: () => {
      const s = get();
      if (s.visitor.tabClosed) return;
      const abandoned = s.visitor.convSinceExit;
      track(
        abandoned ? makeEvent('exit', s.route.startsWith('/checkout') ? 'Exited at checkout' : 'Left after clicking a booking button', s.visitor.checkoutExperienceId ?? undefined)
          : makeEvent('leave', 'Closed the tab (no booking intent)'),
        abandoned ? { conversionExits: 1 } : {},
        { tabClosed: true, convSinceExit: false },
      );
      if (get().visitor.identity) {
        captureLead('new', 'exit');
      } else {
        get().pushToast({
          tone: 'info',
          title: 'Anonymous visitor left',
          body: 'No email captured yet, so there is no lead to call. Signals are kept on the cookie for their next visit.',
        });
      }
    },

    completeBooking: () => {
      const s = get();
      track(makeEvent('booked', 'Completed checkout', s.visitor.checkoutExperienceId ?? undefined), {}, { convSinceExit: false });
      captureLead('converted', 'booked');
      set({ route: '/confirmed' });
    },

    simulateReturnVisit: () => {
      const n = get().visitor.signals.visits + 1;
      track(makeEvent('visit', `Return visit #${n} — session started`), { visits: 1 }, { tabClosed: false });
      if (get().visitor.tabClosed === false && get().route === '/confirmed') set({ route: '/' });
    },

    setTrackerOpen: (open) => set({ trackerOpen: open }),

    setScene: (scene) => set({ scene, drawerLeadId: scene === 'crm' ? get().drawerLeadId : null }),

    setSort: (key) =>
      set((s) => ({
        sort: s.sort.key === key ? { key, dir: s.sort.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: key === 'customer' || key === 'experience' ? 'asc' : 'desc' },
      })),

    setFilter: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),

    openDrawer: (leadId) => set({ drawerLeadId: leadId }),

    updateLead: (id, patch) => set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),

    clearNotifications: () => set({ unreadNotifications: 0 }),

    pushToast: (t) => {
      const id = ++toastSeq;
      set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
      later(() => get().dismissToast(id), 5200);
    },

    dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

    setDemo: (patch) => set((s) => ({ demo: { ...s.demo, ...patch } })),

    setCursor: (patch) => set((s) => ({ demo: { ...s.demo, cursor: { ...s.demo.cursor, ...patch } } })),

    reset: () => {
      clearTimers();
      set({ ...initialState(), demo: { ...initialDemo } });
    },
  };
});

