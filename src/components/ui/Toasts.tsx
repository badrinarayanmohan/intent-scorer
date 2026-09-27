import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useDemoStore } from '../../store/useDemoStore';

/**
 * Global toast stack (top-right). Carries the "New high-intent lead captured → View in
 * CRM" hand-off between the two scenes.
 */
export function Toasts() {
  const toasts = useDemoStore((s) => s.toasts);
  const dismiss = useDemoStore((s) => s.dismissToast);
  const setScene = useDemoStore((s) => s.setScene);

  return (
    <div className="pointer-events-none fixed right-5 top-[72px] z-[60] flex w-[360px] flex-col gap-3">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            className={`pointer-events-auto rounded-card border bg-white p-4 shadow-xl ${
              t.tone === 'flame' ? 'border-orange-200' : 'border-tw-border'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-tile text-lg ${
                  t.tone === 'flame' ? 'bg-tile-orange' : t.tone === 'success' ? 'bg-tile-green' : 'bg-tw-input'
                }`}
              >
                {t.tone === 'flame' ? '🔥' : t.tone === 'success' ? '✅' : '👋'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-tw-ink">{t.title}</div>
                {t.body && <div className="mt-0.5 text-[13px] text-tw-muted">{t.body}</div>}
                {t.action && (
                  <button
                    type="button"
                    data-demo="toast-view-crm"
                    onClick={() => {
                      setScene('crm');
                      dismiss(t.id);
                    }}
                    className="mt-2 text-[13px] font-semibold text-tw-flame hover:underline"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button type="button" onClick={() => dismiss(t.id)} className="text-tw-faint hover:text-tw-muted">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
