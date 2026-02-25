// sw.js
const CACHE_NAME = 'mempass-v2.3';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/constants.js',
    '/crypto.js',
    '/utils.js',
    '/password-generator.js',
    '/vault.js',
    '/document-vault.js',
    '/ui-handlers.js',
    '/main.js',
    'https://cdnjs.cloudflare.com/ajax/libs/argon2-browser/1.18.0/argon2-bundled.min.js',
    'https://unpkg.com/dexie@3.2.3/dist/dexie.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});