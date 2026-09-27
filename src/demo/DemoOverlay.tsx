import { AnimatePresence, motion } from 'framer-motion';
import { useDemoStore } from '../store/useDemoStore';

/**
 * The fake cursor for guided autoplay. It glides to each target before the click so
 * viewers can follow *what* the visitor did, not just see the result.
 */
export function FakeCursor() {
  const cursor = useDemoStore((s) => s.demo.cursor);
  return (
    <AnimatePresence>
      {cursor.visible && (
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-[100]"
          initial={{ opacity: 0, x: cursor.x, y: cursor.y }}
          animate={{ opacity: 1, x: cursor.x, y: cursor.y }}
          exit={{ opacity: 0 }}
          transition={{ x: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }, y: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.2 } }}
        >
          <AnimatePresence>
            {cursor.clicking && (
              <motion.span
                className="absolute -left-5 -top-5 h-10 w-10 rounded-full bg-orange-400/40"
                initial={{ scale: 0.2, opacity: 1 }}
                animate={{ scale: 1.2, opacity: 0.8 }}
                exit={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>
          <motion.svg width="26" height="26" viewBox="0 0 24 24" animate={{ scale: cursor.clicking ? 0.85 : 1 }} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]">
            <path d="M4 2 L4 19 L8.5 14.8 L11.6 21.5 L14.4 20.3 L11.4 13.6 L17.6 13.4 Z" fill="#111827" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Bottom caption bar: plain-language narration of each autoplay step. */
export function CaptionBar() {
  const { caption, step, total, running } = useDemoStore((s) => s.demo);
  // Keep the caption clear of whatever sits on the right: the tracker (website) or the drawer (CRM).
  const rightInset = useDemoStore((s) => (s.scene === 'website' ? (s.trackerOpen ? 376 : 60) : s.drawerLeadId ? 480 : 0));
  return (
    <AnimatePresence>
      {caption && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="pointer-events-none fixed inset-x-0 bottom-5 z-[90] flex justify-center px-6 transition-[padding] duration-300"
          style={{ paddingRight: rightInset + 24 }}
        >
          <div className="w-full max-w-[760px] overflow-hidden rounded-2xl bg-[#0F1320]/95 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur">
            <div className="flex items-center gap-4 px-5 py-3.5">
              {running && (
                <span className="shrink-0 rounded-md bg-white/10 px-2 py-1 font-mono text-[11px] text-slate-300">
                  {step}/{total}
                </span>
              )}
              <AnimatePresence mode="wait">
                <motion.p
                  key={caption}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  data-demo="caption"
                  className="text-[14.5px] leading-snug"
                >
                  {caption}
                </motion.p>
              </AnimatePresence>
            </div>
            {running && (
              <div className="h-1 bg-white/10">
                <motion.div className="h-full bg-tw-flame" animate={{ width: `${(step / Math.max(total, 1)) * 100}%` }} transition={{ duration: 0.4 }} />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
