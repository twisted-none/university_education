const CACHE_NAME = 'smart-todo-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/db.js',
  '/js/notification.js',
  '/js/install.js',
  '/manifest.json',
  '/favicon.ico',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-256x256.png',
  '/images/icons/icon-384x384.png',
  '/images/icons/icon-512x512.png'
];

// Установка Service Worker и кэширование статических ресурсов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кэширование статических ресурсов');
        return cache.addAll(urlsToCache);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Активация Service Worker и очистка старого кэша
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  // Захват контроля над клиентскими страницами сразу
  self.clients.claim();
});

// Стратегия кэширования: сначала сеть, затем кэш
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Проверяем, что ответ действителен
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Клонируем ответ, так как он может быть использован только один раз
        const responseToCache = response.clone();

        // Для запросов GET обновляем кэш
        if (event.request.method === 'GET') {
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }

        return response;
      })
      .catch(() => {
        // Если нет сети, используем кэш
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Если ресурс не найден в кэше, возвращаем страницу офлайн
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            // Для других запросов возвращаем пустой ответ
            return new Response();
          });
      })
  );
});

// Обработка push-уведомлений
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Новое уведомление';
  const options = {
    body: data.body || 'У вас есть невыполненные задачи',
    icon: '/images/icons/icon-192x192.png',
    badge: '/images/icons/icon-192x192.png',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then(clientList => {
        // Проверяем, открыто ли уже окно приложения
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Если нет, открываем новое окно
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});