import { AnimatePresence, motion } from 'framer-motion';
import { Toasts } from './components/ui';
import { TopBar } from './components/TopBar';
import { CaptionBar, FakeCursor } from './demo/DemoOverlay';
import { CrmScene } from './scenes/crm/CrmScene';
import { WebsiteScene } from './scenes/website/WebsiteScene';
import { useDemoStore } from './store/useDemoStore';

/**
 * App shell: persistent top bar, and the two scenes that slide between each other
 * (website → left, CRM ← right) so the hand-off reads as one continuous story.
 */
export default function App() {
  const scene = useDemoStore((s) => s.scene);
  const dir = scene === 'crm' ? 1 : -1;

  return (
    <div className="flex h-screen min-w-[1280px] flex-col overflow-hidden bg-tw-wash">
      <TopBar />
      <main className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={scene}
            custom={dir}
            className="absolute inset-0"
            variants={{
              enter: (d: number) => ({ x: `${d * 100}%`, opacity: 0.4 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: `${-d * 100}%`, opacity: 0.4 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            {scene === 'website' ? <WebsiteScene /> : <CrmScene />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Toasts />
      <FakeCursor />
      <CaptionBar />
    </div>
  );
}
