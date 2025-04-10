const CACHE_NAME = "dietcache-v1";
const CACHE_ASSETS = [
    "/",
    "/manifest.json",
    "/index.html",
    "/styles.css",
    "/app.js",
    "/chart.js"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_ASSETS))
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((names) =>
            Promise.all(names.map((name) => (name !== CACHE_NAME ? caches.delete(name) : null)))
    ));
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
    );
});
