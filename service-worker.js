self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open('paperparachutes').then(function (cache) {
            return cache.addAll([
                './index.html',
                './style.css',
                './PaperParachutes.js',
            ]);
        })
    );
});

// self.addEventListener('fetch', function (event) {
//     console.log(event.request.url);
// });

self.addEventListener('fetch', function (event) {
    // console.log(event.request.url);
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});