// frontend/src/services/teams.ts

import { api } from './api'; // Правильный импорт экземпляра axios
import { Team, TeamCreate, TeamUpdate } from '@/types/team'; // Используем абсолютные пути

// Определяем интерфейс для параметров запроса
interface TeamsQueryParams {
  limit?: number;
  skip?: number;
  search?: string;
}

/**
 * Получить список всех команд с возможностью пагинации и поиска.
 * @param params - Объект с параметрами skip, limit, search
 */
export const getTeams = async (params: TeamsQueryParams = {}): Promise<Team[]> => {
  try {
    // Передаем параметры напрямую в axios, он сам их отформатирует
    const response = await api.get<Team[]>('/teams', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching teams:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch teams');
  }
};

/**
 * Получить одну команду по ее ID.
 * @param id - ID команды
 */
export const getTeamById = async (id: number): Promise<Team> => {
  try {
    const response = await api.get<Team>(`/teams/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching team ${id}:`, error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch team');
  }
};

/**
 * Создать новую команду.
 * @param teamData - Данные для создания команды
 */
export const createTeam = async (teamData: TeamCreate): Promise<Team> => {
  try {
    const response = await api.post<Team>('/teams', teamData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating team:', error);
    throw new Error(error.response?.data?.detail || 'Failed to create team');
  }
};

/**
 * Обновить существующую команду.
 * @param id - ID команды для обновления
 * @param updates - Объект с обновляемыми полями
 */
export const updateTeam = async (id: number, updates: TeamUpdate): Promise<Team> => {
  try {
    const response = await api.put<Team>(`/teams/${id}`, updates);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating team ${id}:`, error);
    throw new Error(error.response?.data?.detail || 'Failed to update team');
  }
};

/**
 * Удалить команду по ее ID.
 * @param id - ID команды для удаления
 */
export const deleteTeam = async (id: number): Promise<void> => {
  try {
    await api.delete(`/teams/${id}`);
  } catch (error: any) {
    console.error(`Error deleting team ${id}:`, error);
    throw new Error(error.response?.data?.detail || 'Failed to delete team');
  }
};

/**
 * Получить статистику команды (пример, как можно добавить другие эндпоинты).
 * @param id - ID команды
 */
export const getTeamStatistics = async (id: number): Promise<any> => {
    try {
      // Предполагается, что такой эндпоинт существует в reports.py
      const response = await api.get(`/reports/team-statistics/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching team ${id} statistics:`, error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch team statistics');
    }
  };

/*
  Примечание:
  Функции, которые вы использовали для клиентской логики, лучше вынести в папку `frontend/src/utils/`
  или использовать непосредственно в компонентах. Сервисный слой должен отвечать только за коммуникацию с API.
  Примеры:
  - getTeamsForSelect() -> лучше реализовать в компоненте формы, который вызывает getTeams().
  - checkTeamNameUnique() -> это бизнес-логика, которая может быть частью валидации в форме.
  - getPlaceColor(), getPlaceDescription() -> это чисто логика отображения, их место в компоненте (`TeamsList.tsx`).
*/