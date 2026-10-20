// Offline support: cache the app shell, serve it when the network is unavailable.
// Bump VERSION on every deploy so phones pick up the new files.
const VERSION = "ws-v4";
const SHELL = [
  "/", "/index.html", "/assets/styles.css", "/assets/app.js", "/assets/analytics.js", "/assets/vendor/mixpanel-2.84.0.min.js", "/manifest.webmanifest",
  "/assets/icons/icon.svg", "/assets/icons/icon-192.png",
  "/assets/fonts/bricolage-grotesque-latin-500-normal.woff2",
  "/assets/fonts/bricolage-grotesque-latin-800-normal.woff2",
  "/assets/fonts/bricolage-grotesque-latin-ext-800-normal.woff2",
  "/assets/fonts/instrument-sans-latin-400-normal.woff2",
  "/assets/fonts/instrument-sans-latin-500-normal.woff2",
  "/assets/fonts/instrument-sans-latin-600-normal.woff2",
  "/assets/fonts/instrument-sans-latin-700-normal.woff2",
  "/assets/fonts/jetbrains-mono-latin-500-normal.woff2",
  "/assets/fonts/jetbrains-mono-latin-700-normal.woff2"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  // Network first, so updates show up; fall back to cache when offline.
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("/index.html")))
  );
});
