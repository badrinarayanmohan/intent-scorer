import { ChevronDown, Lock } from 'lucide-react';
import type { Stage } from '../../store/types';

export const STAGE_META: Record<Stage, { label: string; dot: string; order: number }> = {
  new: { label: 'New', dot: 'bg-tw-red', order: 0 },
  contacted: { label: 'Contacted', dot: 'bg-tw-orange', order: 1 },
  pending: { label: 'Pending Payment', dot: 'bg-tw-blue', order: 2 },
  converted: { label: 'Converted', dot: 'bg-tw-green', order: 3 },
};

/**
 * Pipeline stage pill with a coloured dot. Converted is locked (green wash + lock),
 * every other stage shows a chevron because reps can change it inline.
 */
export function StagePill({ stage }: { stage: Stage }) {
  const meta = STAGE_META[stage];
  const locked = stage === 'converted';
  return (
    <span
      className={`inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-ctl border px-3 text-[14px] text-tw-body ${
        locked ? 'border-[#E3F3E8] bg-[#F4FBF6]' : 'border-tw-border bg-white'
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      {meta.label}
      {locked ? <Lock size={13} className="ml-1 text-tw-faint" /> : <ChevronDown size={14} className="ml-1 text-tw-faint" />}
    </span>
  );
}
