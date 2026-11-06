import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import puppeteer from 'puppeteer';

const origin = 'http://swatch.test';
const base = '/plugins/filament-swatch/';
let browser;
before(async () => {
  browser = await puppeteer.launch({ headless: true, args: process.env.CI ? ['--no-sandbox'] : [] });
});
after(async () => { await browser?.close(); });

async function openPage(params, options = {}) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  const requests = [];
  await page.evaluateOnNewDocument(() => localStorage.setItem('spoolman-url', '/old-server'));
  await page.setRequestInterception(true);
  page.on('request', async (request) => {
    const url = new URL(request.url());
    requests.push(url.href);
    const respond = (value) => request.respond({ contentType: 'application/json', body: JSON.stringify(value) });
    if (url.origin !== origin) return respond([]);
    if (url.pathname === `${base}hosted-config` && options.configStatus) {
      return request.respond({ status: options.configStatus, body: 'Config unavailable' });
    }
    if (url.pathname === `${base}hosted-config` && options.invalidConfig) return respond({});
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
        { id: 2, name: 'Review PETG', vendor: { id: 1, name: 'Review Vendor' }, material: 'PETG', color_hex: '0000FF' },
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
  await page.goto(`${origin}${base}${options.path || ''}?${params}`, { waitUntil: 'networkidle0' });
  return { page, requests, close: () => context.close() };
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

for (const host of ['filaman', 'spoolman']) {
  test(`${host}: failed hosted configuration blocks startup and can be retried`, async () => {
    const params = new URLSearchParams({ [`${host}_hosted`]: '1', [`${host}_hosted_config`]: `${base}hosted-config`, spoolman_locale: 'en' });
    const options = { configStatus: 500, path: 'app/swatch' };
    const { page, requests, close } = await openPage(params, options);
    try {
      assert.ok(await page.$('[role="alert"]'), 'Hosted errors must be visible');
      assert.equal(await page.$('nav'), null);
      assert.equal(requests.some((url) => url.includes('/old-server/')), false);
      assert.equal(requests.some((url) => url.includes('statistics.disane.dev')), false);
      options.configStatus = 0;
      await clickButton(page, 'Retry');
      await page.waitForFunction(() => document.body.innerText.includes('Review PLA'));
      assertHostQuery(page, params);
    } finally { await close(); }
  });

  test(`${host}: missing or invalid hosted configuration cannot launch standalone`, async () => {
    for (const missing of [false, true]) {
      const params = new URLSearchParams({ [`${host}_hosted`]: '1' });
      if (!missing) params.set(`${host}_hosted_config`, `${base}hosted-config`);
      const { page, requests, close } = await openPage(params, { invalidConfig: true, path: 'app/swatch' });
      try {
        assert.ok(await page.$('[role="alert"]'));
        assert.equal(await page.$('nav'), null);
        assert.equal(requests.some((url) => url.includes('/old-server/') || url.includes('statistics.disane.dev')), false);
      } finally { await close(); }
    }
  });
}

test('unsupported host language uses English translations', async () => {
  const params = new URLSearchParams({ filaman_hosted: '1', filaman_hosted_config: `${base}hosted-config`, spoolman_locale: 'fr' });
  const { page, close } = await openPage(params);
  try {
    await page.waitForFunction(() => document.body.innerText.includes('Review PLA'));
    assert.equal(await page.evaluate(() => document.documentElement.lang), 'en');
    const text = await page.$eval('nav', (nav) => nav.innerText);
    assert.ok(text.includes('Filaments'));
    assert.equal(text.includes('app.filaments'), false);
  } finally { await close(); }
});

test('navbar search filters inventory, clears, and restores its value after reload', async () => {
  const params = new URLSearchParams({ filaman_hosted: '1', filaman_hosted_config: `${base}hosted-config`, spoolman_locale: 'en' });
  const { page, close } = await openPage(params);
  try {
    await page.waitForFunction(() => document.querySelectorAll('.card-name').length === 2);
    await page.type('nav input[type="text"]', 'PETG');
    await page.waitForFunction(() => document.querySelectorAll('.card-name').length === 1, { timeout: 3000 });
    assert.equal(await page.$eval('.card-name', (item) => item.textContent.trim()), 'Review PETG');
    assert.equal(new URL(page.url()).searchParams.get('q'), 'PETG');
    assertHostQuery(page, params);
    await page.reload({ waitUntil: 'networkidle0' });
    assert.equal(await page.$eval('nav input[type="text"]', (input) => input.value), 'PETG');
    await page.$eval('nav input[type="text"]', (input) => {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForFunction(() => document.querySelectorAll('.card-name').length === 2);
    assert.equal(new URL(page.url()).searchParams.has('q'), false);
    assertHostQuery(page, params);
  } finally { await close(); }
});
