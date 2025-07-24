// frontend/src/services/matches.ts

import { api } from './api';
import { MatchWithDetails, MatchCreate, MatchUpdate, MatchResult } from '../types/match';

/**
 * Получить список всех матчей с пагинацией.
 * @param skip - Количество пропускаемых записей
 * @param limit - Максимальное количество записей для возврата
 */
export const getMatches = async (skip: number = 0, limit: number = 100): Promise<MatchWithDetails[]> => {
  const response = await api.get<MatchWithDetails[]>(`/matches?skip=${skip}&limit=${limit}`);
  return response.data;
};

/**
 * Получить список предстоящих матчей.
 * @param limit - Максимальное количество матчей для возврата
 */
export const getUpcomingMatches = async (limit: number = 10): Promise<MatchWithDetails[]> => {
  const response = await api.get<MatchWithDetails[]>(`/matches/upcoming?limit=${limit}`);
  return response.data;
};

/**
 * Получить список завершенных матчей.
 */
export const getFinishedMatches = async (): Promise<MatchWithDetails[]> => {
  const response = await api.get<MatchWithDetails[]>('/matches/finished');
  return response.data;
};

/**
 * Получить матчи для конкретной команды.
 * @param teamId - ID команды
 */
export const getMatchesByTeam = async (teamId: number): Promise<MatchWithDetails[]> => {
  const response = await api.get<MatchWithDetails[]>(`/matches/team/${teamId}`);
  return response.data;
};

/**
 * Получить очные встречи между двумя командами.
 * @param team1Id - ID первой команды
 * @param team2Id - ID второй команды
 */
export const getHeadToHeadMatches = async (team1Id: number, team2Id: number): Promise<MatchWithDetails[]> => {
  const response = await api.get<MatchWithDetails[]>(`/matches/head-to-head/${team1Id}/${team2Id}`);
  return response.data;
};

/**
 * Получить детальную информацию о матче по его ID.
 * @param matchId - ID матча
 */
export const getMatchById = async (matchId: number): Promise<MatchWithDetails> => {
  const response = await api.get<MatchWithDetails>(`/matches/${matchId}`);
  return response.data;
};

/**
 * Создать новый матч.
 * @param matchData - Данные для создания матча
 */
export const createMatch = async (matchData: MatchCreate): Promise<MatchWithDetails> => {
  const response = await api.post<MatchWithDetails>('/matches', matchData);
  return response.data;
};

/**
 * Обновить информацию о матче.
 * @param matchId - ID матча
 * @param matchData - Данные для обновления
 */
export const updateMatch = async (matchId: number, matchData: MatchUpdate): Promise<MatchWithDetails> => {
  const response = await api.put<MatchWithDetails>(`/matches/${matchId}`, matchData);
  return response.data;
};

/**
 * Установить результат матча.
 * @param matchId - ID матча
 * @param result - Объект с результатами (голы)
 */
export const setMatchResult = async (matchId: number, result: MatchResult): Promise<MatchWithDetails> => {
  const response = await api.put<MatchWithDetails>(`/matches/${matchId}/result`, result);
  return response.data;
};

/**
 * Отменить матч.
 * @param matchId - ID матча
 */
export const cancelMatch = async (matchId: number): Promise<MatchWithDetails> => {
    const response = await api.put<MatchWithDetails>(`/matches/${matchId}/cancel`);
    return response.data;
}

/**
 * Удалить матч.
 * @param matchId - ID матча
 */
export const deleteMatch = async (matchId: number): Promise<void> => {
  await api.delete(`/matches/${matchId}`);
};