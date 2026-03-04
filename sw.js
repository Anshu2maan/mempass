// sw.js
const CACHE_NAME = 'mempass-v2.3';
const urlsToCache = [
    '/mempass/',
    '/mempass/index.html',
    '/mempass/style.css',
    '/mempass/constants.js',
    '/mempass/crypto.js',
    '/mempass/utils.js',
    '/mempass/password-generator.js',
    '/mempass/vault.js',
    '/mempass/document-vault.js',
    '/mempass/drive-sync.js',
    '/mempass/ui/globals.js',
    '/mempass/ui/pin.js',
    '/mempass/ui/vault-ui.js',
    '/mempass/ui/password.js',
    '/mempass/ui/passwordVaultDisplay.js',
    '/mempass/ui/documents.js',
    '/mempass/ui/preview.js',
    '/mempass/ui/exportImport.js',
    '/mempass/ui/misc.js',
    '/mempass/main.js',
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
