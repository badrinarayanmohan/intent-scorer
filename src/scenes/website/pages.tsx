import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, Clock, DoorOpen, Minus, Plus, ShieldCheck, Star, Users } from 'lucide-react';
import { useEffect } from 'react';
import { EXPERIENCES, getExperience, type Experience } from '../../data/experiences';
import { money } from '../../lib/format';
import { useDemoStore } from '../../store/useDemoStore';

/* ------------------------------------------------------------------------------------ */
/* Shared bits                                                                          */
/* ------------------------------------------------------------------------------------ */

/** Star rating + review count, used on cards and detail pages. */
function Rating({ exp, light = false }: { exp: Experience; light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[13px] ${light ? 'text-white/90' : 'text-slate-600'}`}>
      <Star size={13} className="fill-amber-400 text-amber-400" />
      <span className="font-semibold">{exp.rating}</span>
      <span className={light ? 'text-white/70' : 'text-slate-400'}>({exp.reviewCount})</span>
    </span>
  );
}

/**
 * Experience card. Every click is a `cardClicks` signal — the visitor telling us
 * which product they are interested in.
 */
export function ExperienceCard({ exp, compact = false }: { exp: Experience; compact?: boolean }) {
  const clickCard = useDemoStore((s) => s.clickCard);
  return (
    <button
      type="button"
      data-demo={`card-${exp.id}`}
      onClick={() => clickCard(exp.id)}
      className="group overflow-hidden rounded-2xl bg-white text-left shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(11,59,74,0.25)] ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(11,59,74,0.35)]"
    >
      <div className={`relative overflow-hidden ${compact ? 'h-28' : 'h-40'}`}>
        <img src={exp.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-maui-deep">
          {exp.duration}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="font-display text-[17px] font-semibold text-maui-deep">{exp.name}</div>
          <Rating exp={exp} />
        </div>
        {!compact && <div className="mt-1 line-clamp-1 text-[13px] text-slate-500">{exp.tagline}</div>}
        <div className="mt-3 text-[13px] text-slate-500">
          from <span className="text-[16px] font-bold text-maui-deep">{money(exp.price)}</span> / person
        </div>
      </div>
    </button>
  );
}

/** Gentle fade between pages so route changes read as navigation. */
function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------------------------ */
/* Home + listing                                                                        */
/* ------------------------------------------------------------------------------------ */

/** Home: hero + grid of the five experiences. */
export function HomePage() {
  const navigate = useDemoStore((s) => s.navigate);
  return (
    <Page>
      <section className="relative h-[300px] overflow-hidden">
        <img src="/images/hero.svg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-maui-deep/80 via-maui-deep/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-center px-10">
          <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-cyan-100">Guided tours on Maui since 2009</div>
          <h1 className="mt-3 max-w-xl font-display text-[42px] font-semibold leading-[1.05] text-white">Adventure, the Maui way.</h1>
          <p className="mt-3 max-w-md text-[15px] text-white/85">Small groups, local guides, and memories you'll talk about for years.</p>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/experiences')}
              className="rounded-full bg-maui-coral px-5 py-2.5 text-[14px] font-semibold text-white shadow-lg shadow-black/20"
            >
              Explore experiences
            </button>
            <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2.5 text-[13px] text-white backdrop-blur">
              <Star size={14} className="fill-amber-300 text-amber-300" /> 4.9 · 1,800+ reviews
            </span>
          </div>
        </div>
      </section>
      <section className="px-8 pt-8">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-[26px] font-semibold text-maui-deep">Popular experiences</h2>
          <span className="text-[13px] text-slate-500">Free cancellation up to 24h before</span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-5">
          {EXPERIENCES.map((e) => (
            <ExperienceCard key={e.id} exp={e} />
          ))}
          <div className="flex flex-col justify-center rounded-2xl bg-maui-sea/10 p-6 ring-1 ring-maui-sea/15">
            <div className="font-display text-[20px] font-semibold text-maui-deep">Private charters</div>
            <p className="mt-2 text-[13px] text-slate-600">Planning a group or celebration? We'll tailor any tour.</p>
          </div>
        </div>
      </section>
    </Page>
  );
}

/** Listing page (/experiences) — its own unique page for the `pagesVisited` signal. */
export function ListingPage() {
  return (
    <Page>
      <section className="px-8 pt-8">
        <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-maui-sea">All tours</div>
        <h1 className="mt-1 font-display text-[32px] font-semibold text-maui-deep">Find your Maui adventure</h1>
        <div className="mt-4 flex gap-2">
          {['All', 'On the water', 'On land', 'Evening', 'Family friendly'].map((f, i) => (
            <span
              key={f}
              className={`rounded-full px-3.5 py-1.5 text-[13px] ${i === 0 ? 'bg-maui-deep text-white' : 'bg-white text-slate-600 ring-1 ring-black/10'}`}
            >
              {f}
            </span>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-3 gap-5">
          {EXPERIENCES.map((e) => (
            <ExperienceCard key={e.id} exp={e} />
          ))}
        </div>
      </section>
    </Page>
  );
}

/* ------------------------------------------------------------------------------------ */
/* Experience detail (+ reviews tab)                                                     */
/* ------------------------------------------------------------------------------------ */

const DATES = ['Thu 2', 'Fri 3', 'Sat 4', 'Sun 5', 'Mon 6', 'Tue 7'];

/**
 * Experience detail page. Hosts the two strongest buying signals on the site:
 * "Check Availability" and "Book Now" (both `conversionClicks`).
 */
export function DetailPage({ id, tab }: { id: string; tab: 'overview' | 'reviews' }) {
  const exp = getExperience(id);
  const navigate = useDemoStore((s) => s.navigate);
  const conversionClick = useDemoStore((s) => s.conversionClick);
  const availabilityOpen = useDemoStore((s) => s.availabilityOpen);
  const date = useDemoStore((s) => s.checkoutForm.date);
  const setField = useDemoStore((s) => s.setCheckoutField);
  if (!exp) return <NotFound />;
  const others = EXPERIENCES.filter((e) => e.id !== exp.id).slice(0, 3);

  return (
    <Page>
      <div className="px-8 pt-6">
        <button
          type="button"
          data-demo="back-to-list"
          onClick={() => navigate('/experiences')}
          className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-maui-deep"
        >
          <ArrowLeft size={14} /> All experiences
        </button>

        <div className="mt-4 grid grid-cols-[1fr_300px] gap-8">
          <div className="min-w-0">
            {/* Gallery */}
            <div className="grid h-[260px] grid-cols-[2fr_1fr] gap-2 overflow-hidden rounded-2xl">
              <img src={exp.image} alt="" className="h-full w-full object-cover" />
              <div className="grid grid-rows-2 gap-2">
                <img src={exp.image} alt="" className="h-full w-full scale-150 object-cover object-right" />
                <img src="/images/hero.svg" alt="" className="h-full w-full object-cover" />
              </div>
            </div>
            <h1 className="mt-5 font-display text-[32px] font-semibold leading-tight text-maui-deep">{exp.name}</h1>
            <div className="mt-2 flex items-center gap-4 text-[13px] text-slate-500">
              <Rating exp={exp} />
              <span className="flex items-center gap-1">
                <Clock size={13} /> {exp.duration}
              </span>
              <span className="flex items-center gap-1">
                <Users size={13} /> Small group
              </span>
            </div>

            {/* Tabs — the reviews tab is its own URL so it counts as research depth */}
            <div className="mt-5 flex gap-6 border-b border-slate-200 text-[14px]">
              {(['overview', 'reviews'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  data-demo={`tab-${t}`}
                  onClick={() => navigate(t === 'overview' ? `/${exp.id}` : `/${exp.id}/reviews`)}
                  className={`-mb-px border-b-2 pb-2.5 font-medium capitalize ${
                    tab === t ? 'border-maui-coral text-maui-deep' : 'border-transparent text-slate-500 hover:text-maui-deep'
                  }`}
                >
                  {t === 'reviews' ? `Reviews (${exp.reviewCount})` : 'Overview'}
                </button>
              ))}
            </div>

            {tab === 'overview' ? (
              <div className="py-5">
                <p className="text-[15px] leading-relaxed text-slate-600">{exp.description}</p>
                <ul className="mt-4 space-y-2">
                  {exp.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-[14px] text-slate-700">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-maui-sea/10 text-[11px] text-maui-sea">✓</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="space-y-3 py-5">
                {exp.reviews.map((r) => (
                  <div key={r.author} className="rounded-xl bg-white p-4 ring-1 ring-black/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-semibold text-maui-deep">{r.author}</span>
                      <span className="text-amber-400">{'★'.repeat(r.rating)}</span>
                    </div>
                    <p className="mt-1 text-[14px] text-slate-600">{r.text}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <div className="font-display text-[20px] font-semibold text-maui-deep">You might also like</div>
              <div className="mt-3 grid grid-cols-3 gap-4">
                {others.map((e) => (
                  <ExperienceCard key={e.id} exp={e} compact />
                ))}
              </div>
            </div>
          </div>

          {/* Booking card */}
          <aside className="sticky top-20 h-fit rounded-2xl bg-white p-5 shadow-[0_12px_40px_-16px_rgba(11,59,74,0.35)] ring-1 ring-black/5">
            <div className="text-[13px] text-slate-500">from</div>
            <div className="flex items-baseline gap-1">
              <span className="text-[28px] font-bold text-maui-deep">{money(exp.price)}</span>
              <span className="text-[13px] text-slate-500">/ person</span>
            </div>
            <div className="mt-1 text-[12px] font-medium text-maui-coral">Only 3 spots left this Saturday</div>

            <button
              type="button"
              data-demo="check-availability"
              onClick={() => conversionClick('Check Availability', exp.id)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-maui-deep py-2.5 text-[14px] font-semibold text-maui-deep hover:bg-maui-deep/5"
            >
              <CalendarDays size={16} /> Check Availability
            </button>

            {availabilityOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  {DATES.map((d, i) => (
                    <button
                      key={d}
                      type="button"
                      data-demo={`date-${i}`}
                      disabled={i === 3}
                      onClick={() => {
                        setField({ date: d });
                        conversionClick('Select Date', exp.id);
                      }}
                      className={`rounded-lg py-2 text-[12px] font-medium ring-1 ${
                        i === 3
                          ? 'text-slate-300 ring-slate-100'
                          : date === d
                            ? 'bg-maui-sea text-white ring-maui-sea'
                            : 'text-slate-700 ring-slate-200 hover:ring-maui-sea'
                      }`}
                    >
                      {d}
                      <div className={`text-[10px] ${date === d ? 'text-white/80' : 'text-emerald-600'}`}>{i === 3 ? 'Sold out' : `${[6, 4, 3, 0, 8, 9][i]} left`}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <button
              type="button"
              data-demo="book-now"
              onClick={() => conversionClick('Book Now', exp.id)}
              className="mt-3 w-full rounded-xl bg-maui-coral py-3 text-[15px] font-semibold text-white shadow-lg shadow-maui-coral/30 hover:brightness-105"
            >
              Book Now
            </button>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-slate-500">
              <ShieldCheck size={13} /> Free cancellation · Reserve now, pay later
            </div>
          </aside>
        </div>
      </div>
    </Page>
  );
}

/* ------------------------------------------------------------------------------------ */
/* FAQ, checkout, confirmation                                                          */
/* ------------------------------------------------------------------------------------ */

/** FAQ page — another research page for the `pagesVisited` signal. */
export function FaqPage() {
  const qa = [
    ['What should I bring?', 'Reef-safe sunscreen, a towel and a sense of adventure. We provide everything else.'],
    ['Can I cancel?', 'Free cancellation up to 24 hours before your tour.'],
    ['Are tours kid friendly?', 'Kayaking and the luau welcome ages 5+. Biking is 12+.'],
    ['Do you offer hotel pickup?', 'Yes, from most Wailea, Kīhei and Lahaina resorts.'],
  ];
  return (
    <Page>
      <section className="max-w-2xl px-8 pt-8">
        <h1 className="font-display text-[32px] font-semibold text-maui-deep">Frequently asked questions</h1>
        <div className="mt-5 space-y-3">
          {qa.map(([q, a]) => (
            <div key={q} className="rounded-xl bg-white p-4 ring-1 ring-black/5">
              <div className="text-[15px] font-semibold text-maui-deep">{q}</div>
              <div className="mt-1 text-[14px] text-slate-600">{a}</div>
            </div>
          ))}
        </div>
      </section>
    </Page>
  );
}

/**
 * Checkout. Entering name + email is the identity moment: the anonymous cookie is
 * stitched to a real person, which is what lets the CRM create a callable lead.
 * The "Exit / Close tab" button simulates the abandonment we want reps to rescue.
 */
export function CheckoutPage({ id }: { id: string }) {
  const exp = getExperience(id);
  const form = useDemoStore((s) => s.checkoutForm);
  const setField = useDemoStore((s) => s.setCheckoutField);
  const identify = useDemoStore((s) => s.identify);
  const conversionClick = useDemoStore((s) => s.conversionClick);
  const exitSite = useDemoStore((s) => s.exitSite);
  const completeBooking = useDemoStore((s) => s.completeBooking);

  // Identify as soon as a plausible name + email are present (debounced while typing).
  const valid = form.name.trim().length > 1 && /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(form.email.trim());
  useEffect(() => {
    if (!valid) return;
    const t = setTimeout(() => identify(form.name.trim(), form.email.trim()), 350);
    return () => clearTimeout(t);
  }, [valid, form.name, form.email, identify]);

  if (!exp) return <NotFound />;
  const total = exp.price * form.guests;

  return (
    <Page>
      <div className="grid grid-cols-[1fr_320px] gap-8 px-8 pt-8">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-maui-sea">Secure checkout</div>
          <h1 className="mt-1 font-display text-[30px] font-semibold text-maui-deep">Almost there!</h1>

          <div className="mt-5 rounded-2xl bg-white p-5 ring-1 ring-black/5">
            <div className="text-[15px] font-semibold text-maui-deep">1. Your details</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-[12px] font-medium text-slate-500">
                Full name
                <input
                  data-demo="checkout-name"
                  value={form.name}
                  onChange={(e) => setField({ name: e.target.value })}
                  placeholder="Jane Doe"
                  className="mt-1 block h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] text-slate-800 outline-none focus:border-maui-sea focus:ring-2 focus:ring-maui-sea/20"
                />
              </label>
              <label className="text-[12px] font-medium text-slate-500">
                Email
                <input
                  data-demo="checkout-email"
                  value={form.email}
                  onChange={(e) => setField({ email: e.target.value })}
                  placeholder="you@example.com"
                  className="mt-1 block h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] text-slate-800 outline-none focus:border-maui-sea focus:ring-2 focus:ring-maui-sea/20"
                />
              </label>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white p-5 ring-1 ring-black/5">
            <div className="text-[15px] font-semibold text-maui-deep">2. Date & guests</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {DATES.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  data-demo={`checkout-date-${i}`}
                  disabled={i === 3}
                  onClick={() => {
                    setField({ date: d });
                    conversionClick('Select Date', exp.id);
                  }}
                  className={`w-[76px] rounded-xl py-2 text-[13px] font-medium ring-1 ${
                    i === 3 ? 'text-slate-300 ring-slate-100' : form.date === d ? 'bg-maui-sea text-white ring-maui-sea' : 'text-slate-700 ring-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-[14px] text-slate-600">Guests</span>
              <button type="button" onClick={() => setField({ guests: Math.max(1, form.guests - 1) })} className="grid h-8 w-8 place-items-center rounded-full ring-1 ring-slate-200">
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-[15px] font-semibold">{form.guests}</span>
              <button type="button" onClick={() => setField({ guests: Math.min(10, form.guests + 1) })} className="grid h-8 w-8 place-items-center rounded-full ring-1 ring-slate-200">
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-2xl bg-white p-5 shadow-[0_12px_40px_-16px_rgba(11,59,74,0.35)] ring-1 ring-black/5">
          <img src={exp.image} alt="" className="h-28 w-full rounded-xl object-cover" />
          <div className="mt-3 font-display text-[18px] font-semibold text-maui-deep">{exp.name}</div>
          <div className="text-[13px] text-slate-500">
            {form.date ?? 'Pick a date'} · {form.guests} guest{form.guests > 1 ? 's' : ''}
          </div>
          <div className="mt-4 flex justify-between border-t border-slate-100 pt-3 text-[14px]">
            <span className="text-slate-500">
              {money(exp.price)} × {form.guests}
            </span>
            <span className="font-bold text-maui-deep">{money(total)}</span>
          </div>
          <button
            type="button"
            data-demo="complete-booking"
            onClick={completeBooking}
            disabled={!valid}
            className="mt-4 w-full rounded-xl bg-maui-coral py-3 text-[15px] font-semibold text-white shadow-lg shadow-maui-coral/30 disabled:opacity-40"
          >
            Complete booking
          </button>
          <button
            type="button"
            data-demo="exit-checkout"
            onClick={exitSite}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-2.5 text-[13px] font-medium text-slate-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            <DoorOpen size={15} /> Exit / Close tab
          </button>
          <div className="mt-2 text-center text-[11px] text-slate-400">Simulates the visitor abandoning checkout</div>
        </aside>
      </div>
    </Page>
  );
}

/** Post-booking confirmation page. */
export function ConfirmedPage() {
  const navigate = useDemoStore((s) => s.navigate);
  return (
    <Page>
      <div className="mx-auto max-w-md px-8 pt-20 text-center">
        <div className="text-5xl">🎉</div>
        <h1 className="mt-4 font-display text-[30px] font-semibold text-maui-deep">Mahalo! You're booked.</h1>
        <p className="mt-2 text-[14px] text-slate-600">A confirmation email is on its way.</p>
        <button type="button" onClick={() => navigate('/')} className="mt-6 rounded-full bg-maui-deep px-5 py-2.5 text-[14px] font-semibold text-white">
          Back to home
        </button>
      </div>
    </Page>
  );
}

function NotFound() {
  return <div className="p-10 text-slate-500">Page not found.</div>;
}
