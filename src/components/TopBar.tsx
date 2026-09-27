import { Play, RotateCcw, Square } from 'lucide-react';
import { useMemo } from 'react';
import { playDemo, resetDemo, stopDemo } from '../demo/autoplay';
import { scoreIntent } from '../scoring/scoreIntent';
import { useDemoStore, type Scene } from '../store/useDemoStore';

/**
 * Persistent demo control bar: the Customer View ⇄ Tripworks CRM toggle, the live
 * visitor score, and Play / Reset. Deliberately dark so it reads as "demo chrome",
 * separate from both products underneath.
 */
export function TopBar() {
  const scene = useDemoStore((s) => s.scene);
  const setScene = useDemoStore((s) => s.setScene);
  const running = useDemoStore((s) => s.demo.running);
  const unread = useDemoStore((s) => s.unreadNotifications);
  const signals = useDemoStore((s) => s.visitor.signals);
  const intent = useMemo(() => scoreIntent(signals), [signals]);

  const tab = (id: Scene, label: string) => (
    <button
      type="button"
      data-demo={`scene-${id}`}
      onClick={() => setScene(id)}
      className={`relative flex h-8 items-center gap-2 rounded-lg px-4 text-[13px] font-semibold transition-colors ${
        scene === id ? 'bg-white text-tw-ink shadow' : 'text-slate-300 hover:text-white'
      }`}
    >
      {label}
      {id === 'crm' && unread > 0 && scene !== 'crm' && <span className="h-2 w-2 rounded-full bg-tw-flame" />}
    </button>
  );

  return (
    <div className="relative z-[70] flex h-14 shrink-0 items-center justify-between bg-[#0F1320] px-5 text-white">
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-tw-flame text-[15px]">🔥</span>
        <div className="leading-tight">
          <div className="text-[14px] font-semibold">Tripworks Intent Scorer</div>
          <div className="text-[11px] text-slate-400">Interactive demo</div>
        </div>
      </div>

      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-xl bg-white/10 p-1">
        {tab('website', '🌐 Customer View')}
        {tab('crm', '💼 Tripworks CRM')}
      </div>

      <div className="flex items-center gap-2">
        <span className="mr-2 hidden items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 font-mono text-[12px] text-slate-300 xl:flex" title="Live intent score of the website visitor">
          visitor intent <span className="font-bold text-white">{intent.score.toFixed(1)}</span>
          <span>{'🔥'.repeat(intent.tier.fires) || '·'}</span>
        </span>
        {running ? (
          <button type="button" onClick={stopDemo} className="flex h-9 items-center gap-2 rounded-lg bg-white/10 px-4 text-[13px] font-semibold hover:bg-white/15">
            <Square size={13} className="fill-white" /> Stop
          </button>
        ) : (
          <button
            type="button"
            data-demo="play"
            onClick={() => void playDemo()}
            className="flex h-9 items-center gap-2 rounded-lg bg-tw-flame px-4 text-[13px] font-semibold shadow-lg shadow-orange-900/30 hover:brightness-110"
          >
            <Play size={13} className="fill-white" /> Play demo
          </button>
        )}
        <button type="button" data-demo="reset" onClick={resetDemo} className="flex h-9 items-center gap-2 rounded-lg px-3 text-[13px] font-medium text-slate-300 hover:bg-white/10 hover:text-white">
          <RotateCcw size={14} /> Reset
        </button>
      </div>
    </div>
  );
}
