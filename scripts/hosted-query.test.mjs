import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

test('filter changes preserve host configuration and remove cleared filters', async () => {
  const originalWindow = globalThis.window;
  const url = new URL('http://swatch.test/app/swatch?filaman_hosted=1&filaman_hosted_config=%2Fconfig&filaman_theme=dark&spoolman_locale=en&q=old');
  globalThis.window = {
    location: url,
    localStorage: { getItem: () => null, setItem() {} },
    history: { replaceState: (_state, _title, next) => { url.href = new URL(next, url).href; } },
  };
  const server = await createServer({
    configFile: false,
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true },
    resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
  });
  try {
    const { useFilaments } = await server.ssrLoadModule('/src/composables/useFilaments.ts');
    const { filters } = useFilaments();
    filters.search = 'PLA';
    await new Promise(setImmediate);
    assert.equal(url.searchParams.get('q'), 'PLA');
    assert.equal(url.searchParams.get('filaman_hosted'), '1');
    assert.equal(url.searchParams.get('filaman_hosted_config'), '/config');
    assert.equal(url.searchParams.get('filaman_theme'), 'dark');
    assert.equal(url.searchParams.get('spoolman_locale'), 'en');
    filters.search = '';
    await new Promise(setImmediate);
    assert.equal(url.searchParams.has('q'), false);
    assert.equal(url.searchParams.get('filaman_hosted'), '1');
  } finally {
    await server.close();
    globalThis.window = originalWindow;
  }
});
