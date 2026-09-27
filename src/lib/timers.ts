/**
 * Tracks every scheduled UI timeout (scene transitions, highlight fades) so the
 * Reset button can cancel them all — otherwise a pending "jump to CRM" could fire
 * after the demo has been reset.
 */
const pending = new Set<ReturnType<typeof setTimeout>>();

/** setTimeout that Reset can cancel. */
export function later(fn: () => void, ms: number): void {
  const t = setTimeout(() => {
    pending.delete(t);
    fn();
  }, ms);
  pending.add(t);
}

/** Cancel every timeout scheduled via `later`. */
export function clearTimers(): void {
  pending.forEach(clearTimeout);
  pending.clear();
}
