// Minimal service worker — required for the app to be installable as a PWA
// (Chrome needs a registered SW with a fetch handler). It does a plain
// network pass-through with a cache-fallback for offline navigations, so it
// never interferes with fresh content.
const CACHE = "tbx-shell-v2";
const SHELL = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  // Network-first; fall back to cache only when offline (keeps content fresh).
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (req.mode === "navigate") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match("/"))),
  );
});

// ── Push notifications ─────────────────────────────────────────────────────
// Payload (JSON): { title, body, url, image?, tag?, actions?: [{action,title,url}] }
// Tapping the notification (or an action) opens its link — e.g. the live
// Track91 page for a shipped parcel, the bag, or a book.
self.addEventListener("push", (event) => {
  let d = {};
  try {
    d = event.data ? event.data.json() : {};
  } catch {
    d = { body: event.data ? event.data.text() : "" };
  }
  const title = d.title || "TheBookX";
  const actions = Array.isArray(d.actions) ? d.actions.slice(0, 2) : [];
  const urls = {};
  actions.forEach((a) => {
    if (a && a.action && a.url) urls[a.action] = a.url;
  });
  event.waitUntil(
    self.registration.showNotification(title, {
      body: d.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      image: d.image || undefined,
      tag: d.tag || undefined,
      renotify: !!d.tag,
      data: { url: d.url || "/", urls },
      actions: actions.map((a) => ({ action: a.action, title: a.title })),
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const url = (event.action && data.urls && data.urls[event.action]) || data.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const target = new URL(url, self.location.origin).href;
      const sameSite = target.startsWith(self.location.origin);
      if (sameSite) {
        for (const c of list) {
          if ("focus" in c && "navigate" in c) {
            return c.navigate(target).then((w) => (w || c).focus());
          }
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
