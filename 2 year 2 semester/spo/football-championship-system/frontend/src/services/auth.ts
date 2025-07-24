// frontend/src/services/auth.ts

import { api } from './api';
import { Token, User } from '@/types/user';
import { LoginRequest, RegisterRequest } from '@/types/auth'; // <-- ИСПРАВЛЕННЫЙ ИМПОРТ

/**
 * Отправляет запрос на логин пользователя.
 * @param credentials - Данные для входа (username, password)
 */
export const loginUser = async (credentials: LoginRequest): Promise<Token> => {
  const params = new URLSearchParams();
  params.append('username', credentials.username);
  params.append('password', credentials.password);

  const response = await api.post<Token>('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
};

/**
 * Отправляет запрос на регистрацию нового пользователя.
 * @param userData - Данные для регистрации (username, email, password)
 */
export const registerUser = async (userData: RegisterRequest): Promise<User> => {
  const response = await api.post<User>('/auth/register', userData);
  return response.data;
};

/**
 * Получает информацию о текущем залогиненном пользователе.
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/users/me');
  return response.data;
};