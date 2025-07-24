// frontend/src/services/api.ts

import axios from 'axios';

// ИЗМЕНЕНИЕ: baseURL теперь относительный.
// Он будет автоматически использовать домен и порт, с которого загружен сайт.
// Например, если сайт на http://devops-learning-project.ru:8080,
// то запрос пойдет на http://devops-learning-project.ru:8080/api/...
const api = axios.create({
  baseURL: '/api', // <-- САМОЕ ВАЖНОЕ ИЗМЕНЕНИЕ
});

// Перехватчик для JWT токенов остается таким же
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // Убедитесь, что ключ совпадает с тем, что в AuthContext
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Именованный экспорт для консистентности
export { api };