// frontend/src/services/players.ts

import { api } from './api';
import {
  Player,
  PlayerWithTeam,
  PlayerCreate,
  PlayerUpdate,
  PlayerListParams
} from '../types/player';

/**
 * Получить список игроков с возможностью фильтрации и пагинации.
 * @param params - Объект с параметрами фильтрации (skip, limit, team_id и т.д.)
 */
export const getPlayers = async (params: PlayerListParams = {}): Promise<PlayerWithTeam[]> => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const response = await api.get<PlayerWithTeam[]>(`/players?${queryParams.toString()}`);
  return response.data;
};

/**
 * Получить детальную информацию об игроке по его ID.
 * @param playerId - ID игрока
 */
export const getPlayerById = async (playerId: number): Promise<PlayerWithTeam> => {
  const response = await api.get<PlayerWithTeam>(`/players/${playerId}`);
  return response.data;
};

/**
 * Создать нового игрока.
 * @param playerData - Данные для создания игрока
 */
export const createPlayer = async (playerData: PlayerCreate): Promise<Player> => {
  const response = await api.post<Player>('/players', playerData);
  return response.data;
};

/**
 * Обновить информацию об игроке.
 * @param playerId - ID игрока
 * @param playerData - Данные для обновления
 */
export const updatePlayer = async (playerId: number, playerData: PlayerUpdate): Promise<Player> => {
  const response = await api.put<Player>(`/players/${playerId}`, playerData);
  return response.data;
};

/**
 * Удалить игрока.
 * @param playerId - ID игрока
 */
export const deletePlayer = async (playerId: number): Promise<{ message: string }> => {
  const response = await api.delete(`/players/${playerId}`);
  return response.data;
};

/**
 * Получить игроков в указанном возрастном диапазоне.
 * @param minAge - Минимальный возраст
 * @param maxAge - Максимальный возраст
 */
export const getPlayersByAgeRange = async (minAge: number, maxAge: number): Promise<PlayerWithTeam[]> => {
    const response = await api.get<PlayerWithTeam[]>(`/players/age-range/?min_age=${minAge}&max_age=${maxAge}`);
    return response.data;
};

/**
 * Перевести игрока в другую команду.
 * @param playerId - ID игрока
 * @param newTeamId - ID новой команды
 */
export const transferPlayer = async (playerId: number, newTeamId: number): Promise<{ message: string; player: Player }> => {
    const response = await api.post(`/players/${playerId}/transfer?new_team_id=${newTeamId}`);
    return response.data;
};