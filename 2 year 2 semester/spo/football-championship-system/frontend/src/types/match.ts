// frontend/src/types/match.ts
import { Stadium } from '@/types/stadium';
import { Team } from '@/types/team';

/**
 * Статус матча.
 */
export type MatchStatus = 'scheduled' | 'finished' | 'cancelled';

/**
 * Основной интерфейс для матча с детальной информацией
 * о командах и стадионе. Соответствует схеме `MatchWithDetails` в Pydantic.
 */
export interface MatchWithDetails {
  id: number;
  date: string; // Даты из API приходят как строки в формате ISO
  home_team_id: number;
  away_team_id: number;
  stadium_id: number;
  home_goals: number | null;
  away_goals: number | null;
  status: MatchStatus;
  created_at: string;
  updated_at: string;
  home_team: Team;
  away_team: Team;
  stadium: Stadium;
}

/**
 * Интерфейс для создания нового матча.
 * Соответствует схеме `MatchCreate` в Pydantic.
 */
export interface MatchCreate {
  date: string; // YYYY-MM-DDTHH:MM:SS
  home_team_id: number;
  away_team_id: number;
  stadium_id: number;
}

/**
 * Интерфейс для обновления существующего матча.
 * Поля необязательные, соответствует схеме `MatchUpdate` в Pydantic.
 */
export interface MatchUpdate {
  date?: string;
  home_team_id?: number;
  away_team_id?: number;
  stadium_id?: number;
  home_goals?: number;
  away_goals?: number;
  status?: MatchStatus;
}

/**
 * Интерфейс для установки результата матча.
 * Соответствует схеме `MatchResult` в Pydantic.
 */
export interface MatchResult {
  home_goals: number;
  away_goals: number;
}