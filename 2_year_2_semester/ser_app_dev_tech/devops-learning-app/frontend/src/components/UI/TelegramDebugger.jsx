import React, { useEffect, useState } from 'react';

const TelegramDebugger = () => {
  const [telegramData, setTelegramData] = useState({
    available: false,
    initData: '',
    user: null,
    version: '',
    platform: '',
    timestamp: Date.now()
  });

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      setTelegramData({
        available: true,
        initData: tg.initData || 'не доступно',
        user: tg.initDataUnsafe?.user || null,
        version: tg.version || 'неизвестно',
        platform: tg.platform || 'неизвестно',
        viewportHeight: tg.viewportHeight,
        viewportStableHeight: tg.viewportStableHeight,
        colorScheme: tg.colorScheme,
        auth_date: tg.initDataUnsafe?.auth_date,
        hash: tg.initDataUnsafe?.hash?.substring(0, 10) + '...',
        timestamp: Date.now()
      });
      
      console.log('Telegram WebApp details:', {
        available: true,
        initData: tg.initData,
        initDataUnsafe: tg.initDataUnsafe,
        user: tg.initDataUnsafe?.user,
        version: tg.version,
        platform: tg.platform
      });
    }
  }, []);

  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg m-4 text-sm">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">Telegram Debug Info</h2>
        <div className="text-xs text-gray-500">
          {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      <div className="space-y-2">
        <p><strong>WebApp доступен:</strong> {telegramData.available ? '✅ Да' : '❌ Нет'}</p>
        <p><strong>Версия:</strong> {telegramData.version}</p>
        <p><strong>Платформа:</strong> {telegramData.platform}</p>
        <p><strong>Цветовая схема:</strong> {telegramData.colorScheme}</p>
        <p><strong>Высота окна:</strong> {telegramData.viewportHeight}</p>
        <p><strong>Auth Date:</strong> {telegramData.auth_date 
          ? new Date(telegramData.auth_date * 1000).toLocaleString() 
          : 'не задано'}</p>
        <p><strong>Hash:</strong> {telegramData.hash || 'отсутствует'}</p>
        
        {telegramData.user ? (
          <div>
            <strong>Пользователь:</strong>
            <div className="bg-white p-2 rounded mt-1 text-xs">
              <p><strong>ID:</strong> {telegramData.user.id}</p>
              <p><strong>Имя:</strong> {telegramData.user.first_name}</p>
              <p><strong>Username:</strong> {telegramData.user.username || 'не задан'}</p>
              <p><strong>Язык:</strong> {telegramData.user.language_code}</p>
            </div>
          </div>
        ) : (
          <p><strong>Пользователь:</strong> Данные отсутствуют</p>
        )}
        
        <div>
          <strong>InitData:</strong>
          <pre className="bg-white p-2 rounded mt-1 overflow-x-auto text-xs">
            {telegramData.initData 
              ? (telegramData.initData.length > 100 
                ? telegramData.initData.substring(0, 100) + '...' 
                : telegramData.initData)
              : 'отсутствует'}
          </pre>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Примечание: После отладки удалите этот компонент из App.jsx</p>
      </div>
    </div>
  );
};

export default TelegramDebugger;