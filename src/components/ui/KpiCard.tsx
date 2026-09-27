import type { ReactNode } from 'react';
import { CircleHelp } from 'lucide-react';

export type KpiTone = 'green' | 'blue' | 'yellow' | 'cyan' | 'orange';

const TILE: Record<KpiTone, string> = {
  green: 'bg-tile-green text-tw-green',
  blue: 'bg-tile-blue text-tw-blue',
  yellow: 'bg-tile-yellow text-tw-orange',
  cyan: 'bg-tile-cyan text-sky-500',
  orange: 'bg-tile-orange text-tw-flame',
};

/**
 * Headline metric card from the CRM dashboard: pastel icon tile, big number, label
 * with a help icon. Used for the existing KPIs and the new "Hot Leads Right Now" card,
 * so the new card is pixel-identical to its neighbours.
 */
export function KpiCard({
  icon,
  tone,
  value,
  label,
  valueClassName = 'text-tw-ink',
  hint,
  children,
}: {
  icon: ReactNode;
  tone: KpiTone;
  value: ReactNode;
  label: string;
  valueClassName?: string;
  hint?: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative flex min-w-0 items-center gap-3 rounded-card border border-tw-border bg-white px-4 py-[22px] shadow-card min-[1400px]:gap-4 min-[1400px]:px-5">
      <div className={`grid h-11 w-11 shrink-0 min-[1400px]:h-12 min-[1400px]:w-12 place-items-center rounded-tile ${TILE[tone]}`}>{icon}</div>
      <div className="min-w-0">
        <div className={`text-[26px] font-bold leading-none tracking-[-0.02em] ${valueClassName}`}>{value}</div>
        <div className="mt-2 flex items-center gap-1.5 whitespace-nowrap text-[12.5px] text-tw-muted min-[1400px]:text-[13.5px]" title={hint}>
          {label}
          <CircleHelp size={13} className="hidden shrink-0 text-tw-faint min-[1400px]:block" />
        </div>
      </div>
      {children}
    </div>
  );
}
