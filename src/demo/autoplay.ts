import { PERSONA } from '../data/demoVisitor';
import { useDemoStore } from '../store/useDemoStore';

/**
 * Guided autoplay.
 *
 * The script drives a fake cursor to real DOM elements (found by `data-demo` ids) and
 * calls `.click()` on them, so autoplay goes through exactly the same handlers as a
 * human in free play — the scoring you watch is the real scoring, not a recording.
 */

class Cancelled extends Error {}

let runToken = 0;

const store = () => useDemoStore.getState();

/** Sleep that aborts if the run was stopped or reset meanwhile. */
async function wait(ms: number, token: number) {
  await new Promise((r) => setTimeout(r, ms));
  if (token !== runToken) throw new Cancelled();
}

/** Poll until `cond` is true (or throw after `timeout`). */
async function until(cond: () => boolean, token: number, timeout = 8000) {
  const start = Date.now();
  while (!cond()) {
    if (Date.now() - start > timeout) throw new Error('autoplay: timed out waiting for UI');
    await wait(80, token);
  }
}

/** Find a demo target by id, waiting briefly for it to render. */
async function target(id: string, token: number): Promise<HTMLElement> {
  let el: HTMLElement | null = null;
  await until(() => !!(el = document.querySelector<HTMLElement>(`[data-demo="${id}"]`)), token);
  return el!;
}

/** Glide the fake cursor onto an element (scrolling it into view first if needed). */
async function moveTo(id: string, token: number): Promise<HTMLElement> {
  const el = await target(id, token);
  const r0 = el.getBoundingClientRect();
  if (r0.top < 110 || r0.bottom > window.innerHeight - 110) {
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    await wait(450, token);
  }
  const r = el.getBoundingClientRect();
  store().setCursor({ visible: true, x: r.left + Math.min(r.width / 2, 60), y: r.top + r.height / 2 });
  await wait(650, token);
  return el;
}

/** Move + click, with a visible press. */
async function click(id: string, token: number, pauseAfter = 900) {
  const el = await moveTo(id, token);
  store().setCursor({ clicking: true });
  await wait(140, token);
  el.click();
  store().setCursor({ clicking: false });
  await wait(pauseAfter, token);
}

/** Click a field and "type" into it character by character. */
async function type(id: string, field: 'name' | 'email', text: string, token: number) {
  const el = await moveTo(id, token);
  store().setCursor({ clicking: true });
  el.focus();
  await wait(120, token);
  store().setCursor({ clicking: false });
  for (let i = 1; i <= text.length; i++) {
    store().setCheckoutField({ [field]: text.slice(0, i) });
    await wait(38, token);
  }
  await wait(350, token);
}

interface Step {
  caption: string;
  run: (token: number) => Promise<void>;
}

/** The scripted journey. Captions are written for a viewer with no narration. */
const STEPS: Step[] = [
  {
    caption: 'Meet Alex. They have visited Maui Wild Adventures 3 times this week and once bailed after checking availability. Intent score: 4.8 — Cold.',
    run: (t) => wait(3000, t),
  },
  { caption: 'Alex clicks the Kayaking card — interest in a specific product. Watch the tracker on the right.', run: (t) => click('card-kayaking', t) },
  { caption: 'They read the Kayaking reviews — a new page, so research depth goes up.', run: (t) => click('tab-reviews', t, 1100) },
  { caption: 'Back to all experiences to compare options…', run: (t) => click('back-to-list', t) },
  { caption: '…and a look at Hiking.', run: (t) => click('card-hiking', t) },
  {
    caption: 'But they keep coming back to Kayaking.',
    run: async (t) => {
      await click('back-to-list', t, 500);
      await click('card-kayaking', t);
    },
  },
  { caption: '🎯 Check Availability — one of the strongest buying signals (30% of the score).', run: (t) => click('check-availability', t, 700) },
  { caption: 'Alex picks Saturday…', run: (t) => click('date-2', t, 600) },
  { caption: '🎯 …and clicks Book Now. On to checkout.', run: (t) => click('book-now', t, 900) },
  {
    caption: 'Alex types a name and email. The anonymous visitor is now a real person we can call.',
    run: async (t) => {
      await type('checkout-name', 'name', PERSONA.name, t);
      await type('checkout-email', 'email', PERSONA.email, t);
      await wait(500, t);
    },
  },
  {
    caption: '🚪 …then closes the tab without paying. An abandoned checkout is the most urgent call-back trigger.',
    run: (t) => click('exit-checkout', t, 600),
  },
  {
    caption: 'Tripworks captures a high-intent lead and hands it straight to the sales team.',
    run: async (t) => {
      store().setCursor({ visible: false });
      await until(() => store().scene === 'crm', t);
    },
  },
  {
    caption: 'In the CRM, Alex arrives at the bottom of the list… then the intent sort pulls them straight to #1.',
    run: async (t) => {
      await until(() => store().promotingLeadId === null, t);
      await wait(2600, t);
    },
  },
  {
    caption: '🔥 Hot Leads Right Now ticks up and the bell lights up. Reps know exactly who to call first.',
    run: (t) => wait(2400, t),
  },
  {
    caption: 'Click the score to see why. Every point is explained — no black box.',
    run: async (t) => {
      const lead = store().leads.find((l) => l.email === PERSONA.email);
      await click(`intent-${lead?.id}`, t, 2400);
    },
  },
  {
    caption: '“Why call now” gives the rep a one-line reason and the full website timeline. Call within minutes, not hours.',
    run: async (t) => {
      await moveTo('why-summary', t);
      await wait(3200, t);
    },
  },
];

/** Start the guided demo from a clean slate. */
export async function playDemo() {
  const token = ++runToken;
  const s = store();
  s.reset();
  // Start with empty checkout fields so the viewer sees Alex type them.
  store().setCheckoutField({ name: '', email: '' });
  store().setDemo({ running: true, step: 0, total: STEPS.length, caption: STEPS[0].caption });

  try {
    for (let i = 0; i < STEPS.length; i++) {
      store().setDemo({ step: i + 1, caption: STEPS[i].caption });
      await STEPS[i].run(token);
    }
    store().setCursor({ visible: false });
    store().setDemo({ running: false, caption: 'That’s the Intent Scorer. Click around the site yourself, or press ▶ Play demo again.' });
    await wait(6000, token);
    store().setDemo({ caption: '' });
  } catch (e) {
    if (!(e instanceof Cancelled)) {
      console.error(e);
      store().setDemo({ running: false, caption: '' });
      store().setCursor({ visible: false });
    }
  }
}

/** Stop autoplay where it is (the viewer can keep clicking in free play). */
export function stopDemo() {
  runToken++;
  store().setDemo({ running: false, caption: '' });
  store().setCursor({ visible: false, clicking: false });
}

/** Reset button: cancel autoplay and restore the seeded state. */
export function resetDemo() {
  runToken++;
  store().reset();
}
