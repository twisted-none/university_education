// frontend/src/types/ticket.ts
import { MatchWithDetails } from './match';

/**
 * Категории билетов.
 */
export type TicketCategory = 'VIP' | 'Standard' | 'Economy';

/**
 * Интерфейс для запроса на расчет стоимости билета.
 * Соответствует схеме `TicketCalculationRequest` в Pydantic.
 */
export interface TicketCalculationRequest {
  home_team_id: number;
  away_team_id: number;
  stadium_id: number;
  category: TicketCategory;
}

/**
 * Интерфейс для ответа с расчетом стоимости билета.
 * Соответствует схеме `TicketCalculationResponse` в Pydantic.
 */
export interface TicketCalculationResponse {
  category: TicketCategory;
  price: number;
  base_price: number;
  prestige_coefficient: number;
  category_multiplier: number;
}

/**
 * Основной интерфейс для билета.
 * Соответствует схеме `Ticket` в Pydantic.
 */
export interface Ticket {
  id: number;
  match_id: number;
  category: TicketCategory;
  price: number;
  created_at: string;
  updated_at: string;
}

/**
 * Интерфейс для билета с детальной информацией о матче.
 * Соответствует схеме `TicketWithMatch` в Pydantic.
 */
export interface TicketWithMatch extends Ticket {
  match: MatchWithDetails;
}

/**
 * Интерфейс для создания нового билета.
 * Соответствует схеме `TicketCreate` в Pydantic.
 */
export interface TicketCreate {
  match_id: number;
  category: TicketCategory;
  price: number;
}