const APP_PREFIX = 'PWA Budget Tracker';
const VERSION = 'version.01'
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = "data-cache-v.01";


const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/manifest.json",
    "/styles.css",
    "/index.js",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
];
  

//install service worker
self.addEventListener("install", function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Pre-cache successful!");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    
    self.skipWaiting();
});

//delete data from cache
self.addEventListener("activate", function (e) {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Deleting Cache", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    
    self.clients.claim();
});

//Network requests
self.addEventListener("fetch", function (e) {
    if (e.request.url.includes("/api/")) {
        console.log("[Service Worker] Fetch (data)", e.request.url);
        e.respondWith(
            caches.open(DATA_CACHE_NAME).then((cache) => {
                return fetch(e.request)
                .then((response) => {
                    
                    if (response.status === 200) {
                        cache.put(e.request.url, response.clone());
                    }
                    return response;
                })
                
                .catch((err) => {
                    return cache.match(e.request);
                });
            })
        );
        
        return;
    }
    //Offline accessibility
    e.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(e.request).then((response) => {
                return response || fetch(e.request);
            });
        })
    );
});