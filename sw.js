const CACHE_NAME = "dietcache-v1";
const CACHE_ASSETS = [
  "/manifest.json",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/chart.js",
  "/image.ico",
  "/image.svg"
];

// self.addEventListener("install", (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_ASSETS))
//   );
// });

self.addEventListener("install", (event) => {
  console.log("Service Worker Installed");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching assets...");
      return cache.addAll(CACHE_ASSETS).then(() => {
        console.log("Assets cached successfully!");
      }).catch((error) => {
        console.log("Error caching assets:", error);
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker Activated");
  event.waitUntil(
    caches.keys().then((names) => {
      names.forEach((name) => {
        if (name !== CACHE_NAME) {
          console.log("Deleting old cache:", name);
          caches.delete(name);
        }
      });
    })
  );
});

// self.addEventListener("activate", (event) => {
//   event.waitUntil(
//     caches.keys().then((names) =>
//       Promise.all(names.map((name) => (name !== CACHE_NAME ? caches.delete(name) : null)))
//     )
//   );
// });

// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches.match(event.request).then((response) => response || fetch(event.request))
//   );
// });

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log(`Cache hit: ${event.request.url}`);
        return response; // Return from cache
      } else {
        console.log(`Cache miss: ${event.request.url}`);
        return fetch(event.request); // Fetch from server
      }
    })
  );
});
