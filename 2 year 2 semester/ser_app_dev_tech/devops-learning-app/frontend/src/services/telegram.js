// Интеграция с Telegram Mini App API

export function getTelegramInitData() {
  const tg = window.Telegram?.WebApp;
  
  if (tg) {
    console.log("Telegram WebApp detected");
    console.log("initData available:", !!tg.initData);
    console.log("initData length:", tg.initData?.length || 0);
    
    // Нам нужно вернуть сырой initData без изменений
    return tg.initData || '';
  }

if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  console.log('Telegram WebApp initialized with version:', tg.version);
  // ...остальной код...
}
  
  console.warn("Telegram WebApp not available");
  return '';
}

export function debugTelegram() {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    const debugInfo = {
      version: tg.version,
      platform: tg.platform,
      colorScheme: tg.colorScheme,
      themeParams: tg.themeParams,
      isExpanded: tg.isExpanded,
      viewportHeight: tg.viewportHeight,
      viewportStableHeight: tg.viewportStableHeight,
      headerColor: tg.headerColor,
      backgroundColor: tg.backgroundColor,
      initDataLength: tg.initData?.length || 0
    };
    
    console.log("Telegram Debug Info:", debugInfo);
    
    // Не выводим полную initData в консоль браузера, так как она содержит чувствительные данные
    console.log("initData available:", !!tg.initData);
    
    // Выводим безопасные данные из initDataUnsafe
    if (tg.initDataUnsafe) {
      console.log("initDataUnsafe (safe parts):", {
        auth_date: tg.initDataUnsafe.auth_date,
        user: tg.initDataUnsafe.user ? {
          id: tg.initDataUnsafe.user.id,
          username: tg.initDataUnsafe.user.username,
          first_name: tg.initDataUnsafe.user.first_name,
          last_name: tg.initDataUnsafe.user.last_name
        } : null,
        start_param: tg.initDataUnsafe.start_param,
        chat_type: tg.initDataUnsafe.chat_type,
        chat_instance: tg.initDataUnsafe.chat_instance
      });
    }
    
    return true;
  }
  return false;
}

/**
 * Инициализирует Telegram WebApp
 * @returns {Object|null} - Объект TelegramWebApp или null, если API недоступен
 */
export function initializeTelegram() {
  // Проверяем, что мы в контексте Telegram WebApp
  if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    
    // Настраиваем WebApp
    tg.expand(); // Расширяем WebApp на весь экран
    tg.ready(); // Сообщаем Telegram, что WebApp готов
    
    return tg;
  }
  
  // Если Telegram WebApp не найден, возвращаем null
  console.warn('Telegram WebApp not found. Are you running outside of Telegram?');
  return null;
}

export function logTelegramData() {
  const tg = window.Telegram?.WebApp;
  
  if (tg) {
    console.log('Telegram WebApp available:', !!tg);
    console.log('initData available:', !!tg.initData);
    console.log('initData length:', tg.initData?.length || 0);
    
    // Для безопасности не логируем полный initData, только факт наличия
    
    if (tg.initDataUnsafe) {
      // Логируем только безопасные части данных
      console.log('User ID:', tg.initDataUnsafe.user?.id);
      console.log('Username:', tg.initDataUnsafe.user?.username);
      console.log('First name:', tg.initDataUnsafe.user?.first_name);
      console.log('Auth date available:', !!tg.initDataUnsafe.auth_date);
    }
    
    return true;
  }
  
  console.warn('Telegram WebApp not available for logging');
  return false;
}

/**
 * Закрывает Telegram WebApp и возвращает пользователя в чат
 * @param {string} message - Опциональное сообщение, которое будет показано в чате
 */
export function closeTelegramWebApp(message = null) {
  const tg = window.Telegram?.WebApp;
  
  if (tg) {
    if (message) {
      tg.sendData(JSON.stringify({ message }));
    }
    tg.close();
  } else {
    console.warn('Cannot close Telegram WebApp: API not available');
    // Если запущено не в Telegram, просто перенаправляем на главную
    window.location.href = '/';
  }
}

/**
 * Отправляет данные в бота Telegram
 * @param {Object} data - Данные для отправки
 */
export function sendDataToTelegram(data) {
  const tg = window.Telegram?.WebApp;
  
  if (tg) {
    tg.sendData(JSON.stringify(data));
    return true;
  }
  
  console.warn('Cannot send data to Telegram: API not available');
  return false;
}

/**
 * Показывает всплывающее уведомление в Telegram
 * @param {string} message - Текст уведомления
 */
export function showTelegramNotification(message) {
  const tg = window.Telegram?.WebApp;
  
  if (tg && tg.showPopup) {
    tg.showPopup({
      title: 'Уведомление',
      message,
      buttons: [{ type: 'ok' }]
    });
  } else {
    // Запасной вариант, если API не доступен
    alert(message);
  }
}

/**
 * Получает цветовую тему Telegram
 * @returns {string} - 'light' или 'dark'
 */
export function getTelegramTheme() {
  const tg = window.Telegram?.WebApp;
  
  if (tg) {
    return tg.colorScheme || 'light';
  }
  
  // Запасной вариант для разработки
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Получает данные пользователя из Telegram
 * @returns {Object|null} - Данные пользователя или null
 */
export function getTelegramUser() {
  const tg = window.Telegram?.WebApp;
  
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    return tg.initDataUnsafe.user;
  }
  
  return null;
}