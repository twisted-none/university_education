// Сервис для работы с API
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://devops-learning-project.ru/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавление токена аутентификации к каждому запросу
api.setAuthToken = (token) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если ошибка авторизации - удаляем токен
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;