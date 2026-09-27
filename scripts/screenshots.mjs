/**
 * Visual QA: drives the demo in headless Chromium and saves screenshots of both scenes.
 * Usage: npm run dev (in another terminal), then `node scripts/screenshots.mjs [outDir]`.
 * Also asserts the Definition of Done: autoplay finishes < 60s with the new lead at #1
 * showing 🔥🔥🔥🔥 or more.
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const out = process.argv[2] ?? 'screenshots';
const url = process.env.DEMO_URL ?? 'http://localhost:5173';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: Number(process.env.VW ?? 1440), height: Number(process.env.VH ?? 900) }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

await page.goto(url);
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}/01-website-home.png` });

// CRM before the demo
await page.click('[data-demo="scene-crm"]');
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/02-crm-seeded.png` });
await page.click('[data-demo="scene-website"]');
await page.waitForTimeout(800);

// Guided autoplay, with snapshots along the way
const t0 = Date.now();
await page.click('[data-demo="play"]');
await page.waitForSelector('[data-demo="tab-reviews"]');
await page.waitForTimeout(3500);
await page.screenshot({ path: `${out}/03-website-detail.png` });
await page.waitForSelector('[data-demo="checkout-email"]', { timeout: 30000 });
await page.waitForTimeout(3200);
await page.screenshot({ path: `${out}/04-website-checkout.png` });
await page.waitForSelector('[data-lead-row]', { timeout: 30000 });
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}/05-crm-row-enters.png` });
await page.waitForTimeout(3000);
await page.screenshot({ path: `${out}/06-crm-row-at-top.png` });
await page.waitForSelector('[data-demo="intent-drawer"]', { timeout: 30000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/07-crm-drawer.png` });
await page.waitForFunction(() => !document.querySelector('[data-demo="caption"]')?.textContent?.match(/^“Why call now”/) && document.querySelector('[data-demo="play"]'), null, { timeout: 30000 });
const elapsed = (Date.now() - t0) / 1000;

const first = await page.$eval('[data-lead-row]', (el) => ({ id: el.getAttribute('data-lead-row'), text: el.textContent }));
const fires = (first.text.match(/🔥/g) ?? []).length;
console.log(JSON.stringify({ elapsedSeconds: elapsed, firstRow: first.id, fires, errors }, null, 2));
await browser.close();
if (elapsed > 60 || !first.id?.includes('alex') || fires < 4 || errors.length) process.exit(1);
