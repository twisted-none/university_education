// frontend/src/types/team.ts

/**
 * Основной интерфейс для команды, получаемый от бэкенда.
 * Соответствует схеме `Team` в Pydantic.
 */
export interface Team {
  id: number;
  name: string;
  city: string;
  coach: string;
  last_season_place: number;
  created_at: string; // Даты из API приходят как строки в формате ISO
  updated_at: string;
}

/**
 * Интерфейс для создания новой команды.
 * Соответствует схеме `TeamCreate` в Pydantic.
 */
export interface TeamCreate {
  name: string;
  city: string;
  coach: string;
  last_season_place: number;
}

/**
 * Интерфейс для обновления существующей команды.
 * Поля необязательные, соответствует схеме `TeamUpdate` в Pydantic.
 */
export interface TeamUpdate {
  name?: string;
  city?: string;
  coach?: string;
  last_season_place?: number;
}