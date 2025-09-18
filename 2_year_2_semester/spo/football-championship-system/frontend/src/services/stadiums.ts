// frontend/src/services/stadiums.ts

import { api } from './api';
import { Stadium, StadiumCreate, StadiumUpdate, StadiumListParams, StadiumStatistics } from '../types/stadium';

/**
 * Получить список стадионов с возможностью фильтрации и пагинации.
 * @param params - Объект с параметрами фильтрации (skip, limit, search и т.д.)
 */
export const getStadiums = async (params: StadiumListParams = {}): Promise<Stadium[]> => {
  // Создаем параметры запроса, удаляя все пустые значения
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const response = await api.get<Stadium[]>(`/stadiums?${queryParams.toString()}`);
  return response.data;
};

/**
 * Получить детальную информацию о стадионе по его ID.
 * @param stadiumId - ID стадиона
 */
export const getStadiumById = async (stadiumId: number): Promise<Stadium> => {
  const response = await api.get<Stadium>(`/stadiums/${stadiumId}`);
  return response.data;
};

/**
 * Создать новый стадион.
 * @param stadiumData - Данные для создания стадиона
 */
export const createStadium = async (stadiumData: StadiumCreate): Promise<Stadium> => {
  const response = await api.post<Stadium>('/stadiums', stadiumData);
  return response.data;
};

/**
 * Обновить информацию о стадионе.
 * @param stadiumId - ID стадиона
 * @param stadiumData - Данные для обновления
 */
export const updateStadium = async (stadiumId: number, stadiumData: StadiumUpdate): Promise<Stadium> => {
  const response = await api.put<Stadium>(`/stadiums/${stadiumId}`, stadiumData);
  return response.data;
};

/**
 * Удалить стадион.
 * @param stadiumId - ID стадиона
 */
export const deleteStadium = async (stadiumId: number): Promise<void> => {
  await api.delete(`/stadiums/${stadiumId}`);
};

/**
 * Получить статистику по конкретному стадиону.
 * @param stadiumId - ID стадиона
 */
export const getStadiumStatistics = async (stadiumId: number): Promise<StadiumStatistics> => {
  const response = await api.get<StadiumStatistics>(`/stadiums/${stadiumId}/statistics`);
  return response.data;
};

/**
 * Получить список всех городов, в которых есть стадионы.
 */
export const getStadiumCities = async (): Promise<string[]> => {
  const response = await api.get<{ cities: string[] }>('/stadiums/cities/list');
  return response.data.cities;
};

/**
 * Получить список стадионов, свободных на определенную дату.
 * @param date - Дата в формате ISO (YYYY-MM-DDTHH:MM:SS)
 */
export const getAvailableStadiums = async (date: string): Promise<Stadium[]> => {
    const response = await api.get<Stadium[]>(`/stadiums/available/${date}`);
    return response.data;
}