import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import puppeteer from 'puppeteer';

const origin = 'http://swatch.test';
const base = '/plugins/filament-swatch/';
let browser;
before(async () => { browser = await puppeteer.launch({ headless: true }); });
after(async () => { await browser?.close(); });

async function openPage(params) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  await page.setRequestInterception(true);
  page.on('request', async (request) => {
    const url = new URL(request.url());
    const respond = (value) => request.respond({ contentType: 'application/json', body: JSON.stringify(value) });
    if (url.origin !== origin) return respond([]);
    if (url.pathname === `${base}hosted-config`) return respond({
      contract_version: 1, mode: 'hosted', app_key: 'filaman',
      spoolman_base_url: '/spoolman', app_base_path: base,
    });
    if (url.pathname.startsWith('/spoolman/api/v1/')) {
      const endpoint = url.pathname.split('/').pop();
      if (endpoint === 'health') return respond({ status: 'healthy' });
      if (endpoint === 'info') return respond({ version: 'test' });
      if (endpoint === 'filament') return respond([
        { id: 1, name: 'Review PLA', vendor: { id: 1, name: 'Review Vendor' }, material: 'PLA', color_hex: 'FF0000' },
      ]);
      return respond([]);
    }
    const path = url.pathname.slice(base.length);
    let body;
    try { body = await readFile(new URL(`../dist/${path}`, import.meta.url)); }
    catch { body = await readFile(new URL('../dist/index.html', import.meta.url)); }
    const extension = path.split('.').pop();
    const contentType = { js: 'application/javascript', css: 'text/css', svg: 'image/svg+xml' }[extension] || 'text/html';
    await request.respond({ contentType, body });
  });
  await page.goto(`${origin}${base}?${params}`, { waitUntil: 'networkidle0' });
  return { page, close: () => context.close() };
}

async function clickButton(page, text) {
  const clicked = await page.evaluate((label) => {
    const button = [...document.querySelectorAll('button')].find((item) => item.textContent.trim() === label);
    button?.click();
    return Boolean(button);
  }, text);
  assert.ok(clicked, `Missing button: ${text}`);
}

function assertHostQuery(page, params) {
  const actual = new URL(page.url()).searchParams;
  for (const [key, value] of params) assert.equal(actual.get(key), value, `Lost ${key}`);
}

for (const host of ['filaman', 'spoolman']) {
  const params = new URLSearchParams({
    [`${host}_hosted`]: '1', [`${host}_hosted_config`]: `${base}hosted-config`,
    [`${host}_theme`]: 'dark', spoolman_locale: 'en',
  });

  test(`${host}: navigation and reload keep the host configuration`, async () => {
    const { page, close } = await openPage(params);
    try {
      await page.waitForFunction(() => document.body.innerText.includes('Review PLA'));
      await clickButton(page, 'Projects');
      await page.waitForFunction(() => location.pathname.endsWith('/app/projects'));
      assertHostQuery(page, params);
      await page.goBack({ waitUntil: 'networkidle0' });
      assert.ok(new URL(page.url()).pathname.endsWith('/app/swatch'));
      await page.goForward({ waitUntil: 'networkidle0' });
      assert.ok(new URL(page.url()).pathname.endsWith('/app/projects'));
      await page.reload({ waitUntil: 'networkidle0' });
      assert.ok(await page.evaluate(() => Boolean(window.__FILAMAN_HOSTED__ || window.__SPOOLMAN_HOSTED__)));
      assert.equal(await page.evaluate(() => document.documentElement.lang), 'en');
      assert.ok(await page.evaluate(() => document.documentElement.classList.contains('dark')));
      await clickButton(page, 'Filaments');
      await page.waitForFunction(() => location.pathname.endsWith('/app/swatch'));
      assertHostQuery(page, params);
    } finally { await close(); }
  });

  test(`${host}: hosted server and theme controls are hidden`, async () => {
    const { page, close } = await openPage(params);
    try {
      assert.equal(await page.$('nav button[aria-label="Spoolman URL"]'), null);
      assert.equal(await page.$$eval('nav [role="combobox"]', (items) => items.length), 1);
    } finally { await close(); }
  });
}

test('standalone launches still use the landing page', async () => {
  const { page, close } = await openPage(new URLSearchParams());
  try {
    assert.equal(new URL(page.url()).pathname, base);
    assert.equal(await page.evaluate(() => Boolean(window.__FILAMAN_HOSTED__ || window.__SPOOLMAN_HOSTED__)), false);
    assert.equal(await page.$('nav button[title="Filters"]'), null);
  } finally { await close(); }
});
