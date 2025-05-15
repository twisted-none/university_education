import React, { createContext, useState, useEffect } from 'react';
import { initializeTelegram, getTelegramUser, getTelegramInitData, logTelegramData } from '../services/telegram';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [telegramApp, setTelegramApp] = useState(null);
  
  // Добавляем функцию для логирования в консоль контейнера
  const serverLog = async (message, data = {}) => {
    try {
      await api.post('/log', { message, data });
    } catch (error) {
      console.error('Failed to send log to server:', error);
    }
  };

  useEffect(() => {
    async function initialize() {
      try {
        // Инициализируем Telegram WebApp
        const tg = initializeTelegram();
        setTelegramApp(tg);
        
        // Логируем данные для отладки
        console.log('Initializing Telegram WebApp');
        logTelegramData();
        
        // Вывод информации в консоль сервера
        if (tg) {
          serverLog('Telegram WebApp initialized', { 
            initDataAvailable: !!tg.initData, 
            userAvailable: !!tg.initDataUnsafe?.user 
          });
        }
        
        // Проверяем сохраненный токен
        const token = localStorage.getItem('accessToken');
        if (token) {
          api.setAuthToken(token);
          try {
            // Проверяем валидность токена
            const response = await api.get('/auth/validate-token');
            setUser(response.data);
            setLoading(false);
            return;
          } catch (error) {
            console.error('Token validation failed:', error);
            serverLog('Token validation failed', { error: error.message });
            // Токен недействителен, удаляем и пробуем авторизоваться через Telegram
            localStorage.removeItem('accessToken');
          }
        }
        
        // Даем время для инициализации Telegram WebApp
        // Telegram иногда требует некоторое время для полной инициализации
        setTimeout(() => {
          authenticateWithTelegram(window.Telegram?.WebApp);
        }, 3000);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        serverLog('Auth initialization failed', { error: error.message });
        setLoading(false);
      }
    }
    
    initialize();
  }, []);
  
  const authenticateWithTelegram = async (telegramApp) => {
    try {
      // Получаем данные пользователя и initData снова, чтобы убедиться, что они доступны
      const telegramUser = getTelegramUser();
      const initData = getTelegramInitData(); // Получаем полную строку initData
      
      console.log('Authenticating with Telegram');
      console.log('User data available:', !!telegramUser);
      console.log('initData available:', !!initData);
      serverLog('Authenticating with Telegram', { 
        userAvailable: !!telegramUser, 
        initDataAvailable: !!initData,
        initData: initData,
        telegramUser: telegramUser
      });
      
      if (telegramApp && initData) {
        try {
          // Отправляем данные на сервер для аутентификации
          const authData = {
            telegram_id: telegramUser?.id || 0,
            username: telegramUser?.username || '',
            first_name: telegramUser?.first_name || '',
            last_name: telegramUser?.last_name || '',
            photo_url: telegramUser?.photo_url || '',
            auth_date: telegramApp.initDataUnsafe?.auth_date || Math.floor(Date.now() / 1000),
            hash: '',  // Хеш будет проверяться из init_data на сервере
            init_data: initData // Отправляем полную строку initData
          };
          
          serverLog('Sending auth data to server', authData);
          
          const response = await api.post('/auth/telegram', authData);
          
          const { access_token, user } = response.data;
          localStorage.setItem('accessToken', access_token);
          api.setAuthToken(access_token);
          setUser(user);
          console.log('Authentication successful:', user);
          serverLog('Authentication successful', { userId: user.id, username: user.username });
        } catch (error) {
          console.error('Authentication error:', error.response?.data || error.message);
          serverLog('Authentication error', { 
            error: error.response?.data || error.message,
            status: error.response?.status 
          });
          
          // В режиме разработки используем тестового пользователя
          if (process.env.NODE_ENV === 'development') {
            console.log('Using test user in development mode');
            setUser({
              id: 1,
              username: 'test_user',
              first_name: 'Test',
              last_name: ''
            });
          }
        }
      } else if (!initData && telegramApp) {
        // Если initData не доступны, но telegramApp существует, 
        // возможно нужно немного подождать и попробовать снова
        console.warn('Telegram data not fully loaded, retrying in 1 second');
        serverLog('Telegram data not fully loaded, retrying');
        
        setTimeout(() => {
          authenticateWithTelegram(window.Telegram?.WebApp);
        }, 1000);
        return;
      } else {
        console.warn('No Telegram data available');
        serverLog('No Telegram data available');
        
        // В режиме разработки используем тестового пользователя
        if (process.env.NODE_ENV === 'development') {
          console.log('Using test user in development mode');
          setUser({
            id: 1,
            username: 'test_user',
            first_name: 'Test',
            last_name: ''
          });
        }
      }
    } catch (error) {
      console.error('Authentication process error:', error);
      serverLog('Authentication process error', { error: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  // Функция для выхода пользователя
  const logout = () => {
    localStorage.removeItem('accessToken');
    api.setAuthToken(null);
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, setUser, loading, telegramApp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}