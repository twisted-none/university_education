// frontend/src/services/reports.ts

import { api } from './api';
import {
  TournamentTable,
  MatchStatistics,
  TeamStatistics,
  TopScorer,
  GeneralStatistics,
  SeasonSummary,
  HeadToHeadAnalysis,
  TeamComparisonReport
} from '../types/report';

/**
 * Получить актуальную турнирную таблицу.
 */
export const getTournamentStandings = async (): Promise<TournamentTable> => {
  const response = await api.get<TournamentTable>('/reports/standings');
  return response.data;
};

/**
 * Получить общую статистику по матчам.
 */
export const getMatchStatistics = async (): Promise<MatchStatistics> => {
  const response = await api.get<MatchStatistics>('/reports/match-statistics');
  return response.data;
};

/**
 * Получить детальную статистику для конкретной команды.
 * @param teamId - ID команды
 */
export const getTeamStatistics = async (teamId: number): Promise<TeamStatistics> => {
  const response = await api.get<TeamStatistics>(`/reports/team-statistics/${teamId}`);
  return response.data;
};

/**
 * Получить список самых результативных команд.
 * @param limit - Количество команд для возврата (по умолчанию 5)
 */
export const getTopScoringTeams = async (limit: number = 5): Promise<TopScorer[]> => {
  const response = await api.get<TopScorer[]>(`/reports/top-scorers?limit=${limit}`);
  return response.data;
};

/**
 * Получить общую статистику турнира.
 */
export const getGeneralStatistics = async (): Promise<GeneralStatistics> => {
  const response = await api.get<GeneralStatistics>('/reports/general-statistics');
  return response.data;
};

/**
 * Получить полный отчет по итогам сезона.
 */
export const getSeasonSummary = async (): Promise<SeasonSummary> => {
  const response = await api.get<SeasonSummary>('/reports/season-summary');
  return response.data;
};

/**
 * Получить анализ очных встреч между двумя командами.
 * @param team1Id - ID первой команды
 * @param team2Id - ID второй команды
 */
export const getHeadToHeadAnalysis = async (team1Id: number, team2Id: number): Promise<HeadToHeadAnalysis> => {
    const response = await api.get<HeadToHeadAnalysis>(`/reports/head-to-head/${team1Id}/${team2Id}`);
    return response.data;
}

/**
 * Сравнить статистику двух команд.
 * @param team1Id - ID первой команды
 * @param team2Id - ID второй команды
 */
export const getTeamComparison = async (team1Id: number, team2Id: number): Promise<TeamComparisonReport> => {
    const response = await api.get<TeamComparisonReport>(`/reports/team-comparison/${team1Id}/${team2Id}`);
    return response.data;
}