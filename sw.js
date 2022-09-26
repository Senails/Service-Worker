const StaticCacheName = 's-app-v7';
const DinamicCache = 'd-app-v7';

const assets = [
    './js/app.js',
    './css/styles.css',
    './offline.html',
    './sw.js',
    './manifest.json',
    '/'
]

self.addEventListener('install', async(e) => {
    let cache = await caches.open(StaticCacheName);
    await cache.addAll(assets);
})

self.addEventListener('activate', async() => {
    let keys = await caches.keys();
    await Promise.all(keys
        .filter(name => name !== StaticCacheName)
        .filter(name => name !== DinamicCache)
        .map(name => caches.delete(name)))
})

self.addEventListener('fetch', (e) => {
    let { request } = e;

    let url = new URL(request.url);

    if (url.origin === location.origin) {
        e.respondWith(cachefirst(request));
    } else {
        e.respondWith(networkfirst(request));
    }
})

async function cachefirst(req) {
    let cached = await caches.match(req);
    console.log(req);
    return cached ? cached : await fetch(req);
}

async function networkfirst(req) {
    let cache = await caches.open(DinamicCache);
    try {
        let res = await fetch(req);
        await cache.put(req, res.clone());
        return res;
    } catch {
        let res = await cache.match(req);
        return res ? res : await cache.match('./offline.html');
    }
}