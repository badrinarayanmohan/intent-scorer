import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';

/**
 * Filter bar chip. Two flavours, both matching the CRM screenshot:
 *  - dropdown (Source, Experience, Intent): opens a small menu of options
 *  - toggle with a count badge (At Risk, Needs Attention, Unassigned)
 */
export function FilterChip({
  icon,
  label,
  active,
  count,
  onToggle,
  options,
  value,
  onSelect,
  demoId,
  accent,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  count?: number;
  onToggle?: () => void;
  options?: { value: string | null; label: ReactNode }[];
  value?: string | null;
  onSelect?: (v: string | null) => void;
  demoId?: string;
  accent?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close the menu on outside click, like a native select.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const isDropdown = !!options;
  const selected = options?.find((o) => o.value === value && o.value !== null);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        data-demo={demoId}
        onClick={() => (isDropdown ? setOpen((o) => !o) : onToggle?.())}
        className={`flex h-10 items-center gap-2 whitespace-nowrap rounded-ctl border px-3 text-[14px] transition-colors ${
          active || selected
            ? accent
              ? 'border-orange-200 bg-orange-50 text-orange-700'
              : 'border-indigo-200 bg-indigo-50/60 text-indigo-700'
            : 'border-tw-border bg-white text-tw-body hover:bg-tw-wash'
        }`}
      >
        <span className={active || selected ? '' : 'text-tw-muted'}>{icon}</span>
        {selected ? selected.label : label}
        {count !== undefined && (
          <span className="grid h-[22px] min-w-[22px] place-items-center rounded-md bg-tw-input px-1.5 text-[12px] font-semibold text-tw-muted">
            {count}
          </span>
        )}
        {isDropdown && <ChevronDown size={15} className="text-tw-faint" />}
      </button>
      {open && options && (
        <div className="absolute left-0 top-12 z-30 min-w-[180px] rounded-ctl border border-tw-border bg-white p-1 shadow-lg">
          {options.map((o) => (
            <button
              key={String(o.value)}
              type="button"
              data-demo={demoId ? `${demoId}-${o.value ?? 'all'}` : undefined}
              onClick={() => {
                onSelect?.(o.value);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[14px] text-tw-body hover:bg-tw-wash"
            >
              {o.label}
              {value === o.value && <Check size={14} className="text-indigo-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
