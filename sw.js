// Simple service worker to prevent 404 errors and caching issues
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
    // Always fetch from network so we don't accidentally cache old data
    e.respondWith(fetch(e.request));
});
