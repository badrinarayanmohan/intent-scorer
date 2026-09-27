import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useDemoStore } from '../../store/useDemoStore';
import { BrowserFrame, SiteFooter, SiteHeader } from './SiteChrome';
import { SignalTracker } from './SignalTracker';
import { CheckoutPage, ConfirmedPage, DetailPage, FaqPage, HomePage, ListingPage } from './pages';

/** Tiny path router for the mock site (no react-router needed for six pages). */
function RouteView({ route }: { route: string }) {
  if (route === '/') return <HomePage />;
  if (route === '/experiences') return <ListingPage />;
  if (route === '/faq') return <FaqPage />;
  if (route === '/confirmed') return <ConfirmedPage />;
  const checkout = route.match(/^\/checkout\/([\w-]+)$/);
  if (checkout) return <CheckoutPage id={checkout[1]} />;
  const detail = route.match(/^\/([\w-]+)(\/reviews)?$/);
  if (detail) return <DetailPage id={detail[1]} tab={detail[2] ? 'reviews' : 'overview'} />;
  return <HomePage />;
}

/** Shown after the visitor closes the tab: the session is over until they come back. */
function TabClosed() {
  const simulateReturnVisit = useDemoStore((s) => s.simulateReturnVisit);
  const identity = useDemoStore((s) => s.visitor.identity);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-30 grid place-items-center bg-[#F8F9FA]">
      <div className="text-center">
        <div className="text-5xl">🚪</div>
        <div className="mt-3 text-[18px] font-semibold text-slate-700">{identity?.name ?? 'The visitor'} left the site</div>
        <p className="mt-1 max-w-sm text-[14px] text-slate-500">
          The tab is closed. Tripworks keeps their signals, so the next visit picks up right where they left off.
        </p>
        <button
          type="button"
          onClick={simulateReturnVisit}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white"
        >
          <RotateCcw size={14} /> Simulate return visit
        </button>
      </div>
    </motion.div>
  );
}

/**
 * Scene 1: the operator's customer-facing booking site, framed in a fake browser,
 * with the Live Signal Tracker docked on the right.
 */
export function WebsiteScene() {
  const route = useDemoStore((s) => s.route);
  const tabClosed = useDemoStore((s) => s.visitor.tabClosed);
  const scroller = useRef<HTMLDivElement>(null);

  // New page → scroll to top, like a real navigation.
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [route]);

  return (
    <div className="flex h-full gap-4 bg-gradient-to-br from-slate-200 via-slate-100 to-cyan-50 p-4">
      <div className="min-w-0 flex-1">
        <BrowserFrame>
          <div ref={scroller} data-scroll-root className="absolute inset-0 overflow-y-auto bg-maui-sand">
            <SiteHeader />
            <RouteView route={route} />
            <SiteFooter />
          </div>
          {tabClosed && <TabClosed />}
        </BrowserFrame>
      </div>
      <SignalTracker />
    </div>
  );
}
