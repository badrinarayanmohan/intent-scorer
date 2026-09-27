import { initials } from '../../lib/format';

/**
 * Purple rounded-square avatar with white initials — the Tripworks CRM's customer
 * marker. Tripworks uses initials (not photos) because most leads never upload one.
 */
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-avatar bg-tw-purple font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
