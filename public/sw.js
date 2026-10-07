const CACHE = "haim-v3";
const OFFLINE_URL = "/offline.html";

// Never cache auth flows or API calls — always go to the network
const BYPASS = ["/api/", "/auth/", "/login", "/instructor-login"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([OFFLINE_URL, "/pwa-icon.png"]))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function putInCache(request, response) {
  if (!response || !response.ok || response.redirected) return;
  const clone = response.clone();
  caches.open(CACHE).then((cache) => cache.put(request, clone));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (BYPASS.some((p) => url.pathname.startsWith(p))) return;

  // Hashed build assets never change — serve from cache first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            putInCache(request, response);
            return response;
          })
      )
    );
    return;
  }

  // Everything else: network first, fall back to cache, then offline page
  event.respondWith(
    fetch(request)
      .then((response) => {
        putInCache(request, response);
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          return (await caches.match(OFFLINE_URL)) || Response.error();
        }
        return Response.error();
      })
  );
});
