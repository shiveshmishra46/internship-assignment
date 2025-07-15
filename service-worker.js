// Service Worker for offline functionality

const CACHE_NAME = 'travel-companion-v1';

// Resources to cache initially
const INITIAL_CACHE_RESOURCES = [
  '/',
  '/index.html',
  '/styles.css',
  '/js/app.js',
  '/js/geolocation.js',
  '/js/canvas-map.js',
  '/js/intersection-observer.js',
  '/js/background-tasks.js',
  '/js/network-info.js',
  '/manifest.json'
];

// Install event - cache initial resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(INITIAL_CACHE_RESOURCES);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // For API requests, use network only
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response so it can be returned and stored in cache
        const responseToCache = response.clone();
        
        // Cache the successful response
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
          
        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(event.request);
      })
  );
});