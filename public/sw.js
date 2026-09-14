/* STACKUP HOLD'EM HEROES — CACHE RESET WORKER 20260914-v3 */
const APP_SCOPE_PATH = '/gemeo.stackup.holdem-heroes/';
const RESET_VERSION = '20260914-v3';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    try {
      const names = await caches.keys();
      for (const name of names) {
        try {
          const cache = await caches.open(name);
          const requests = await cache.keys();
          const belongsToHeroes = requests.some(request => {
            try { return new URL(request.url).pathname.startsWith(APP_SCOPE_PATH); }
            catch (_) { return false; }
          });
          if (belongsToHeroes) await caches.delete(name);
        } catch (_) {}
      }
    } catch (_) {}

    try { await self.registration.unregister(); } catch (_) {}

    try {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clients) {
        try {
          const url = new URL(client.url);
          url.searchParams.set('_swretire', RESET_VERSION);
          client.navigate(url.toString());
        } catch (_) {}
      }
    } catch (_) {}
  })());
});
