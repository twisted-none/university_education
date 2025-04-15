// Модуль для работы с push-уведомлениями
const NotificationManager = (() => {
    let swRegistration = null;
    const NOTIFICATION_PERMISSION_GRANTED = 'granted';
    const NOTIFICATION_PERMISSION_DENIED = 'denied';
    const NOTIFICATION_PERMISSION_DEFAULT = 'default';
    
    // Проверка поддержки уведомлений
    const areNotificationsSupported = () => {
        return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    };
    
    // Получение статуса разрешения на уведомления
    const getNotificationPermissionStatus = () => {
        return Notification.permission;
    };
    
    // Запрос разрешения на показ уведомлений
    const requestNotificationPermission = async () => {
        if (!areNotificationsSupported()) {
            console.log('Уведомления не поддерживаются в этом браузере');
            return false;
        }
        
        try {
            const permission = await Notification.requestPermission();
            if (permission === NOTIFICATION_PERMISSION_GRANTED) {
                console.log('Разрешение на уведомления получено');
                await registerServiceWorker();
                return true;
            } else {
                console.log('Разрешение на уведомления не получено');
                return false;
            }
        } catch (error) {
            console.error('Ошибка при запросе разрешения:', error);
            return false;
        }
    };
    
    // Регистрация service worker для уведомлений
    const registerServiceWorker = async () => {
        if (!('serviceWorker' in navigator)) {
            throw new Error('Service Worker не поддерживается');
        }
        
        try {
            swRegistration = await navigator.serviceWorker.ready;
            console.log('Service Worker зарегистрирован');
            return swRegistration;
        } catch (error) {
            console.error('Ошибка при регистрации Service Worker:', error);
            throw error;
        }
    };
    
    // Отправка локального уведомления
    const sendNotification = (title, options = {}) => {
        if (!areNotificationsSupported() || Notification.permission !== NOTIFICATION_PERMISSION_GRANTED) {
            console.log('Нет разрешения на отправку уведомлений');
            return;
        }
        
        const defaultOptions = {
            body: 'Уведомление от приложения "Умный список задач"',
            icon: '/images/icons/icon-192x192.png',
            badge: '/images/icons/icon-192x192.png',
            vibrate: [100, 50, 100],
            data: { url: window.location.href }
        };
        
        const notificationOptions = { ...defaultOptions, ...options };
        
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, notificationOptions);
        });
    };
    
    // Отправка уведомления о новой задаче
    const sendNewTaskNotification = (taskText) => {
        sendNotification('Новая задача добавлена', {
            body: `"${taskText}"`,
            data: { action: 'view-task' }
        });
    };
    
    // Настройка периодических уведомлений о невыполненных задачах
    const setupReminderNotifications = () => {
        if (!areNotificationsSupported() || Notification.permission !== NOTIFICATION_PERMISSION_GRANTED) {
            return;
        }
        
        // Проверяем каждые 2 часа наличие активных задач
        const checkInterval = 2 * 60 * 60 * 1000; // 2 часа в миллисекундах
        
        setInterval(() => {
            const activeTasks = TodoDB.getActiveTodos();
            if (activeTasks.length > 0) {
                sendNotification('Напоминание о задачах', {
                    body: `У вас ${activeTodos.length} невыполненных задач`,
                    data: { action: 'view-active-tasks' }
                });
            }
        }, checkInterval);
        
        // Для демонстрации: также можно сохранить время следующего уведомления в localStorage
        const nextReminderTime = Date.now() + checkInterval;
        localStorage.setItem('nextReminderTime', nextReminderTime);
    };
    
    return {
        areNotificationsSupported,
        getNotificationPermissionStatus,
        requestNotificationPermission,
        sendNotification,
        sendNewTaskNotification,
        setupReminderNotifications
    };
})();