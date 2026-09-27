/**
 * Records the guided autoplay as a crisp MP4 for the portfolio page.
 *
 * Uses Chrome's screencast (lossless-ish JPEG frames with timestamps) at 2× device
 * scale instead of Playwright's built-in recorder, whose VP8 output blurs UI text.
 *
 *   npm run build && npx vite preview --port 4173
 *   FFMPEG=/path/to/ffmpeg node scripts/record-demo.mjs [outDir]
 *
 * Writes <outDir>/intent-scorer-demo.mp4, poster.jpg and chapters.json.
 */
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const out = resolve(process.argv[2] ?? 'portfolio/media');
const url = process.env.DEMO_URL ?? 'http://localhost:4173';
const ffmpeg = process.env.FFMPEG ?? 'ffmpeg';
const W = 1440, H = 900, SCALE = 2, OUT_W = 1920, OUT_H = 1200, FPS = 30;

mkdirSync(out, { recursive: true });
const frames = mkdtempSync(join(tmpdir(), 'demo-frames-'));

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
await page.goto(url);
await page.waitForTimeout(1500);

// --- capture frames -------------------------------------------------------------
const cdp = await page.context().newCDPSession(page);
const shots = []; // { file, t }
cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
  const file = join(frames, `f${String(shots.length).padStart(5, '0')}.jpg`);
  writeFileSync(file, Buffer.from(data, 'base64'));
  shots.push({ file, t: metadata.timestamp });
  await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
});
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: W * SCALE, maxHeight: H * SCALE, everyNthFrame: 1 });
const t0 = Date.now();
const since = () => (Date.now() - t0) / 1000;

// Chapters: note when key captions first appear.
const chapters = [];
const marks = [
  [/^Meet Alex/, 'Alex returns to the site (score 4.8, Cold)'],
  [/Kayaking card/, 'Browsing: every click becomes a signal'],
  [/Check Availability/, 'Booking clicks: the strongest signal'],
  [/closes the tab/, 'Abandoned checkout'],
  [/arrives at the bottom/, 'CRM: the lead climbs to #1'],
  [/Click the score/, 'Why is this lead hot?'],
];
const poll = setInterval(async () => {
  const cap = await page.$eval('[data-demo="caption"]', (e) => e.textContent ?? '').catch(() => '');
  for (const [re, title] of marks) {
    if (re.test(cap) && !chapters.find((c) => c.title === title)) chapters.push({ t: Math.max(0, since() - 0.3), title });
  }
}, 150);

await page.waitForTimeout(1200); // hold on the home page before pressing play
await page.click('[data-demo="play"]');
await page.waitForFunction(() => document.querySelector('[data-demo="caption"]')?.textContent?.startsWith('That’s the Intent Scorer'), null, { timeout: 90_000 });
await page.waitForTimeout(3500);
await page.screenshot({ path: join(out, 'poster.jpg'), type: 'jpeg', quality: 88 });
clearInterval(poll);
await cdp.send('Page.stopScreencast');
await page.waitForTimeout(300);
await browser.close();

// --- encode ---------------------------------------------------------------------
// Screencast frames arrive only when something changes, so turn them into a
// constant-frame-rate video by giving each frame its real on-screen duration.
const list = shots
  .map((s, i) => {
    const next = shots[i + 1]?.t ?? s.t + 1;
    return `file '${s.file}'\nduration ${Math.max(0.001, next - s.t).toFixed(4)}`;
  })
  .join('\n');
writeFileSync(join(frames, 'list.txt'), `${list}\nfile '${shots[shots.length - 1].file}'\n`);

execFileSync(ffmpeg, [
  '-y', '-loglevel', 'error',
  '-f', 'concat', '-safe', '0', '-i', join(frames, 'list.txt'),
  '-vf', `scale=${OUT_W}:${OUT_H}:flags=lanczos,fps=${FPS},format=yuv420p`,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-tune', 'stillimage',
  '-movflags', '+faststart', '-an',
  join(out, 'intent-scorer-demo.mp4'),
], { stdio: 'inherit' });

writeFileSync(join(out, 'chapters.json'), JSON.stringify(chapters, null, 2));
console.log(JSON.stringify({ frames: shots.length, seconds: shots.at(-1).t - shots[0].t, chapters }, null, 2));
