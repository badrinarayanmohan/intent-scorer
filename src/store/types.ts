import type { Signals } from '../scoring/config';

/**
 * A single captured behaviour on the operator's website. These are what a real
 * Tripworks tracking snippet would emit; the CRM timeline replays them for reps.
 */
export type EventKind =
  | 'visit' // a new (or return) session started
  | 'page' // page view
  | 'card' // clicked an experience card
  | 'conversion' // Book Now / Check Availability / Select Date
  | 'identify' // visitor typed name + email → anonymous session linked to a lead
  | 'exit' // left after a conversion click without completing checkout
  | 'leave' // left without any booking intent
  | 'booked'; // completed checkout

export interface TrackedEvent {
  id: string;
  kind: EventKind;
  /** Short human text, e.g. "Clicked card: Kayaking". */
  label: string;
  /** Epoch ms. */
  at: number;
  /** Page path or experience id, used to build the "Why call now" summary. */
  detail?: string;
  /** True for events stitched in from earlier sessions (shown dimmed in the tracker). */
  prior?: boolean;
  /** Intent score right after this event — lets the tracker show a "+0.4" delta per event. */
  score?: number;
}

export type Stage = 'new' | 'contacted' | 'pending' | 'converted';

export type LeadSource = 'Website' | 'Instagram' | 'Google Ads' | 'Referral' | 'Facebook';

/** A lead row in the Tripworks CRM. */
export interface Lead {
  id: string;
  name: string;
  email: string;
  experienceId: string | null;
  stage: Stage;
  value: number;
  source: LeadSource;
  assignee: string | null;
  flagged: boolean;
  signals: Signals;
  events: TrackedEvent[];
  createdAt: number;
  lastActivityAt: number;
}
