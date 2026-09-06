/*
 * Offline support for the Bhakthi Bookshelf app shell.
 *
 * Registered only inside the Capacitor app (see ServiceWorkerRegister),
 * so the website's users are unaffected. Goal: once the reader has
 * opened Downloads / a book online, those screens keep working with no
 * network. The store, checkout and account screens are online-only and
 * are left to fail normally offline.
 */

const VERSION = "bbs-offline-v1";
const PRECACHE = `${VERSION}-precache`;
const RUNTIME = `${VERSION}-runtime`;

// Routes that must survive offline. Everything else is online-only.
const OFFLINE_ROUTES = ["/downloads"];
const PRECACHE_URLS = [...OFFLINE_ROUTES, "/vendor/pdf.worker.min.mjs"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) =>
        Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            fetch(url, { credentials: "same-origin" }).then((res) => {
              if (res.ok) return cache.put(url, res);
            })
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isReaderRoute(url) {
  return (
    OFFLINE_ROUTES.includes(url.pathname) ||
    url.pathname.startsWith("/reader/")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Hashed build assets — safe to cache forever, serve cache-first.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/vendor/")
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // App-shell navigations we want offline.
  if (request.mode === "navigate" && isReaderRoute(url)) {
    event.respondWith(networkThenCache(request));
    return;
  }

  // A cold offline launch lands on "/" — send it somewhere useful.
  if (request.mode === "navigate" && url.pathname === "/") {
    event.respondWith(
      fetch(request).catch(
        () =>
          caches.match("/downloads") ||
          new Response(
            "<meta http-equiv=\"refresh\" content=\"0; url=/downloads\">",
            { headers: { "Content-Type": "text/html" } }
          )
      )
    );
    return;
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res.ok) {
    const cache = await caches.open(RUNTIME);
    cache.put(request, res.clone());
  }
  return res;
}

async function networkThenCache(request) {
  const cache = await caches.open(RUNTIME);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch (err) {
    const cached =
      (await cache.match(request)) ||
      (await caches.match("/downloads"));
    if (cached) return cached;
    throw err;
  }
}
