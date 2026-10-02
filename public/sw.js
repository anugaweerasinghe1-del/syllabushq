// SyllabusHQ offline support: pages are network-first (fresh when online,
// last-seen copy when offline); built assets & fonts are cache-first.
const CACHE = "shq-v1";
const OFFLINE_URLS = ["/", "/practice"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(OFFLINE_URLS).catch(() => {}))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname.startsWith("/_serverFn") || url.pathname.startsWith("/api/")) return;

  const isAsset =
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/fonts/"));
  const isFont = url.hostname.endsWith("gstatic.com") || url.hostname.endsWith("googleapis.com");

  if (isAsset || isFont) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok || res.type === "opaque") {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  if (req.mode === "navigate" && url.origin === self.location.origin) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches
            .match(req)
            .then((hit) => hit || caches.match("/practice"))
            .then((hit) => hit || caches.match("/"))
            .then(
              (hit) =>
                hit ||
                new Response("<h1>You're offline</h1><p>Open SyllabusHQ once online to save pages for offline use.</p>", {
                  headers: { "Content-Type": "text/html" },
                }),
            ),
        ),
    );
  }
});
