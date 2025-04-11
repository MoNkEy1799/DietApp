const CACHE_NAME = "dietcache-v0";
const CACHE_ASSETS = [
    "/",
    "/manifest.json",
    "/index.html",
    "/js_css/styles.css",
    "/js_css/app.js",
    "/js_css/chart.js",
    "/js_css/annotations.js",
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
