// Модуль для установки PWA на устройство
const InstallManager = (() => {
    let deferredPrompt;
    const installButton = document.getElementById('installBtn');
    
    // Инициализация обработчиков событий
    const init = () => {
        // Скрываем кнопку установки по умолчанию
        if (installButton) {
            installButton.style.display = 'none';
        }
        
        // Слушаем событие beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            // Предотвращаем автоматический показ диалога установки
            e.preventDefault();
            // Сохраняем событие для использования позже
            deferredPrompt = e;
            // Показываем кнопку установки
            if (installButton) {
                installButton.style.display = 'block';
            }
        });
        
        // Добавляем обработчик нажатия на кнопку установки
        if (installButton) {
            installButton.addEventListener('click', installApp);
        }
        
        // Слушаем событие завершения установки
        window.addEventListener('appinstalled', () => {
            // Скрываем кнопку установки
            if (installButton) {
                installButton.style.display = 'none';
            }
            // Очищаем отложенный промпт
            deferredPrompt = null;
            // Уведомляем пользователя
            console.log('PWA успешно установлено!');
        });
    };
    
    // Функция установки приложения
    const installApp = () => {
        if (!deferredPrompt) {
            return;
        }
        
        // Показываем диалог установки
        deferredPrompt.prompt();
        
        // Ждем выбора пользователя
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Пользователь согласился установить PWA');
            } else {
                console.log('Пользователь отказался от установки PWA');
            }
            // Очищаем отложенный промпт
            deferredPrompt = null;
        });
    };
    
    // Проверка, установлено ли приложение
    const isAppInstalled = () => {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true;
    };
    
    return {
        init,
        installApp,
        isAppInstalled
    };
})();

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    InstallManager.init();
});