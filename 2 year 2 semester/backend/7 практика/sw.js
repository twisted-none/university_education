// Название кэша
const CACHE_NAME = 'notes-app-v1';

// Файлы для предварительного кэширования
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/db.js',
  '/manifest.json',
  '/icons/favicon.ico',
  '/icons/apple-touch-icon.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Установка Service Worker и предварительное кэширование
self.addEventListener('install', event => {
  console.log('Service Worker устанавливается');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кэширование файлов');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Активация сразу после установки
  );
});

// Активация Service Worker и очистка старых кэшей
self.addEventListener('activate', event => {
  console.log('Service Worker активирован');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Удаление старого кэша:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim()) // Берём контроль над всеми открытыми страницами
  );
});

// Перехват запросов
self.addEventListener('fetch', event => {
  console.log('Fetch перехвачен для:', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем кэшированный ответ, если он существует
        if (response) {
          console.log('Найдено в кэше:', event.request.url);
          return response;
        }
        
        console.log('Не найдено в кэше, загрузка из сети:', event.request.url);
        
        // Клонируем запрос для использования - запрос может быть использован только один раз
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest)
          .then(response => {
            // Проверяем валидность ответа
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Клонируем ответ для кэширования
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                console.log('Кэширование ресурса:', event.request.url);
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(error => {
            console.log('Ошибка при загрузке ресурса:', error);
            // При ошибке возвращаем страницу офлайн, если это HTML-запрос
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});