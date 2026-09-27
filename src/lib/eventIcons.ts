import type { EventKind } from '../store/types';

/** Emoji per tracked event kind — shared by the Live Signal Tracker and the CRM timeline. */
export const EVENT_ICON: Record<EventKind, string> = {
  visit: '🔁',
  page: '📄',
  card: '🖱️',
  conversion: '🎯',
  identify: '🪪',
  exit: '🚪',
  leave: '👋',
  booked: '✅',
};
