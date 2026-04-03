const CACHE_NAME = 'soyprofesional-v4';
const OFFLINE_URL = '/offline.html';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/offline.html',
    '/icons/icon.svg',
    '/icons/icon-512.png',
];

// Install event - cache static assets + offline page
// NOTE: We do NOT call skipWaiting() here so the UpdatePrompt
// can show a banner first. The client sends SKIP_WAITING when ready.
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Activate event - clean old caches and notify clients
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => {
            // Take control of all clients immediately
            return self.clients.claim();
        }).then(() => {
            // Notify all clients that the new version is active
            return self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({ type: 'SW_UPDATED', version: CACHE_NAME });
                });
            });
        })
    );
});

// Listen for SKIP_WAITING message from the UpdatePrompt
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Fetch event - network first, fallback to cache, then offline page
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin &&
        !url.hostname.includes('fonts.googleapis.com') &&
        !url.hostname.includes('fonts.gstatic.com')) {
        return;
    }

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request)
                        .then((cachedResponse) => {
                            return cachedResponse || caches.match(OFFLINE_URL);
                        });
                })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse.ok) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
        })
    );
});

// ============================================
// PUSH NOTIFICATIONS
// ============================================

// Handle incoming push notifications
self.addEventListener('push', (event) => {
    let data = {
        title: 'SOYPROFESIONAL',
        body: 'Tenés una nueva notificación',
        icon: '/icons/icon-512.png',
        badge: '/icons/icon-512.png',
        tag: 'default',
        url: '/',
    };

    // Parse push data if available
    if (event.data) {
        try {
            const pushData = event.data.json();
            data = { ...data, ...pushData };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/icons/icon-512.png',
        badge: data.badge || '/icons/icon-512.png',
        tag: data.tag || 'default',
        vibrate: [200, 100, 200],
        renotify: true,
        requireInteraction: false,
        data: {
            url: data.url || '/',
            dateOfArrival: Date.now(),
        },
        actions: data.actions || [],
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification click - open app or focus existing window
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url || '/';

    // Handle action button clicks
    if (event.action === 'reply') {
        // Open chat
        event.waitUntil(
            clients.openWindow(event.notification.data?.chatUrl || '/messages')
        );
        return;
    }

    if (event.action === 'view-profile') {
        event.waitUntil(
            clients.openWindow(event.notification.data?.profileUrl || '/')
        );
        return;
    }

    // Default click - open or focus app
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // If app is already open, focus it and navigate
                for (const client of clientList) {
                    if ('focus' in client) {
                        client.focus();
                        client.postMessage({
                            type: 'NOTIFICATION_CLICK',
                            url: targetUrl,
                        });
                        return;
                    }
                }
                // Otherwise, open new window
                return clients.openWindow(targetUrl);
            })
    );
});

// Handle notification close (for analytics)
self.addEventListener('notificationclose', (event) => {
    // Could send analytics about dismissed notifications
    console.log('[SW] Notification dismissed:', event.notification.tag);
});
