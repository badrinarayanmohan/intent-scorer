import { ArrowLeft, ArrowRight, Lock, RotateCw, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useDemoStore } from '../../store/useDemoStore';

/**
 * Fake browser window around the operator site. The URL bar makes every page view
 * legible to the viewer ("/kayaking/reviews"), and the tab's ✕ is a second way to
 * abandon — exactly how real shoppers leave.
 */
export function BrowserFrame({ children }: { children: ReactNode }) {
  const route = useDemoStore((s) => s.route);
  const exitSite = useDemoStore((s) => s.exitSite);
  const navigate = useDemoStore((s) => s.navigate);
  const tabClosed = useDemoStore((s) => s.visitor.tabClosed);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-300/70 bg-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.35)]">
      <div className="flex h-10 shrink-0 items-end gap-2 bg-[#DEE1E6] px-3">
        <div className="mb-3 flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        </div>
        {!tabClosed && (
          <div className="ml-3 flex h-8 w-60 items-center gap-2 rounded-t-lg bg-white px-3 text-[12px] text-slate-700">
            <span className="text-[13px]">🌺</span>
            <span className="flex-1 truncate">Maui Wild Adventures</span>
            <button
              type="button"
              data-demo="close-tab"
              onClick={exitSite}
              title="Close tab (leave the site)"
              className="grid h-5 w-5 place-items-center rounded-full text-slate-500 hover:bg-slate-200"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-3">
        <button type="button" onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-600" title="Back">
          <ArrowLeft size={16} />
        </button>
        <ArrowRight size={16} className="text-slate-300" />
        <RotateCw size={14} className="text-slate-400" />
        <div className="flex h-7 flex-1 items-center gap-2 rounded-full bg-[#F1F3F4] px-3 text-[12.5px] text-slate-600">
          <Lock size={11} className="text-slate-500" />
          {tabClosed ? (
            <span className="text-slate-400">New Tab</span>
          ) : (
            <span>
              mauiwildadventures.com<span className="text-slate-900">{route === '/' ? '' : route}</span>
            </span>
          )}
        </div>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

/** Operator site header: wordmark + nav. Nav clicks are tracked as page views. */
export function SiteHeader() {
  const navigate = useDemoStore((s) => s.navigate);
  const route = useDemoStore((s) => s.route);
  const link = (path: string, label: string, demo?: string) => (
    <button
      type="button"
      data-demo={demo}
      onClick={() => navigate(path)}
      className={`text-[14px] font-medium transition-colors ${route === path ? 'text-maui-deep' : 'text-slate-500 hover:text-maui-deep'}`}
    >
      {label}
    </button>
  );
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-black/5 bg-maui-sand/90 px-8 backdrop-blur">
      <button type="button" data-demo="site-logo" onClick={() => navigate('/')} className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-maui-sea text-lg text-white">🌺</span>
        <span className="font-display text-[19px] font-semibold tracking-tight text-maui-deep">Maui Wild Adventures</span>
      </button>
      <nav className="flex items-center gap-7">
        {link('/', 'Home')}
        {link('/experiences', 'Experiences', 'nav-experiences')}
        {link('/faq', 'FAQ', 'nav-faq')}
        <span className="text-[14px] text-slate-400">(808) 555-0142</span>
      </nav>
    </header>
  );
}

/** Footer with the "Powered by Tripworks" badge operators get on their booking sites. */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-black/5 bg-maui-deep px-8 py-8 text-[13px] text-cyan-100/70">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-[16px] text-white">Maui Wild Adventures</div>
          <div className="mt-1">Makena Landing · Kīhei, HI 96753</div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[12px] text-white/80">
          <span className="grid h-4 w-4 place-items-center rounded bg-tw-flame text-[9px] font-bold text-white">T</span>
          Booking powered by <span className="font-semibold text-white">Tripworks</span>
        </div>
      </div>
    </footer>
  );
}
