// Service Worker for Push Notifications

// Install event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

// Push event
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');

  if (!event.data) {
    console.log('[Service Worker] Push event has no data');
    return;
  }

  const data = event.data.json();
  const { title, body, icon, badge, tag, data: notificationData } = data;

  const options = {
    body: body || 'You have a new notification',
    icon: icon || '/icon-192x192.png',
    badge: badge || '/badge-72x72.png',
    tag: tag || 'default',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: notificationData || {},
  };

  event.waitUntil(
    self.registration.showNotification(title || 'New Notification', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/feed';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // No existing window, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline support (optional)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      fetch('/api/notifications/sync', {
        method: 'POST',
        credentials: 'include',
      })
        .then(response => response.json())
        .then(data => {
          console.log('[Service Worker] Notifications synced:', data);
        })
        .catch(err => {
          console.error('[Service Worker] Sync failed:', err);
        })
    );
  }
});

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
