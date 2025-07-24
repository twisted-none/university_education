// frontend/src/types/player.ts
import { Team } from './team';

/**
 * Позиции игроков, используемые на бэкенде.
 */
export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';

/**
 * Базовый интерфейс для игрока.
 */
export interface Player {
  id: number;
  team_id: number;
  first_name: string;
  last_name: string;
  age: number;
  jersey_number: number;
  position: PlayerPosition;
  created_at: string;
  updated_at: string;
}

/**
 * Интерфейс для игрока с детальной информацией о команде.
 * Соответствует схеме `PlayerWithTeam` в Pydantic.
 */
export interface PlayerWithTeam extends Player {
  team: Team;
}

/**
 * Интерфейс для создания нового игрока.
 * Соответствует схеме `PlayerCreate` в Pydantic.
 */
export interface PlayerCreate {
  first_name: string;
  last_name: string;
  age: number;
  jersey_number: number;
  position: PlayerPosition;
  team_id: number;
}

/**
 * Интерфейс для обновления существующего игрока.
 * Поля необязательные, соответствует схеме `PlayerUpdate` в Pydantic.
 */
export interface PlayerUpdate {
  first_name?: string;
  last_name?: string;
  age?: number;
  jersey_number?: number;
  position?: PlayerPosition;
  team_id?: number;
}

/**
 * Интерфейс для параметров фильтрации списка игроков.
 */
export interface PlayerListParams {
    skip?: number;
    limit?: number;
    team_id?: number;
    position?: PlayerPosition;
    search?: string;
}