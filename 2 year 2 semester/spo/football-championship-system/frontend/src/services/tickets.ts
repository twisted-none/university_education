// frontend/src/services/tickets.ts

import { api } from './api';
import {
  Ticket,
  TicketCreate,
  TicketCalculationRequest,
  TicketCalculationResponse,
  TicketWithMatch,
  TicketCategory
} from '../types/ticket';

// --- Функции расчета и генерации ---

/**
 * Рассчитать стоимость одного билета для определенной категории.
 * @param requestData - Данные для расчета (ID команд, стадиона, категория)
 */
export const calculateTicketPrice = async (
  requestData: TicketCalculationRequest
): Promise<TicketCalculationResponse> => {
  const response = await api.post<TicketCalculationResponse>('/tickets/calculate', requestData);
  return response.data;
};

/**
 * Рассчитать стоимость билетов для всех категорий для конкретного матча.
 * @param home_team_id - ID домашней команды
 * @param away_team_id - ID гостевой команды
 * @param stadium_id - ID стадиона
 */
export const calculateAllCategoriesForMatch = async (
    home_team_id: number,
    away_team_id: number,
    stadium_id: number,
): Promise<Record<string, TicketCalculationResponse>> => {
    const params = new URLSearchParams({
        home_team_id: String(home_team_id),
        away_team_id: String(away_team_id),
        stadium_id: String(stadium_id),
    });
    // match_id в URL - это заглушка, так как реальные данные передаются через query-параметры.
    const response = await api.get(`/tickets/calculate/match/0?${params.toString()}`);
    return response.data;
};

/**
 * Создать билеты всех категорий для конкретного матча.
 * @param matchId - ID матча
 * @param autoCalculatePrices - Флаг, указывающий, нужно ли автоматически рассчитывать цены
 */
export const createTicketsForAllCategories = async (matchId: number, autoCalculatePrices: boolean = true): Promise<Ticket[]> => {
    const response = await api.post<Ticket[]>(`/tickets/match/${matchId}/create-all?auto_calculate_prices=${autoCalculatePrices}`);
    return response.data;
};


// --- CRUD-операции с билетами ---

/**
 * Получить список всех билетов с пагинацией.
 * @param skip - Количество пропускаемых записей
 * @param limit - Максимальное количество записей для возврата
 */
export const getTickets = async (skip: number = 0, limit: number = 100): Promise<Ticket[]> => {
  const response = await api.get<Ticket[]>(`/tickets?skip=${skip}&limit=${limit}`);
  return response.data;
};

/**
 * Получить билет по ID вместе с информацией о матче.
 * @param ticketId - ID билета
 */
export const getTicketById = async (ticketId: number): Promise<TicketWithMatch> => {
  const response = await api.get<TicketWithMatch>(`/tickets/${ticketId}`);
  return response.data;
};

/**
 * Получить все билеты для конкретного матча.
 * @param matchId - ID матча
 */
export const getTicketsByMatch = async (matchId: number): Promise<Ticket[]> => {
    const response = await api.get<Ticket[]>(`/tickets/match/${matchId}`);
    return response.data;
};

/**
 * Получить все билеты по категории.
 * @param category - Категория билета ('VIP', 'Standard', 'Economy')
 */
export const getTicketsByCategory = async (category: TicketCategory): Promise<Ticket[]> => {
    const response = await api.get<Ticket[]>(`/tickets/category/${category}`);
    return response.data;
};

/**
 * Получить билеты в указанном ценовом диапазоне.
 * @param minPrice - Минимальная цена
 * @param maxPrice - Максимальная цена
 */
export const getTicketsByPriceRange = async (minPrice: number, maxPrice: number): Promise<Ticket[]> => {
    const response = await api.get<Ticket[]>(`/tickets/price-range/?min_price=${minPrice}&max_price=${maxPrice}`);
    return response.data;
};

/**
 * Создать новый билет.
 * @param ticketData - Данные для создания билета
 */
export const createTicket = async (ticketData: TicketCreate): Promise<Ticket> => {
  const response = await api.post<Ticket>('/tickets', ticketData);
  return response.data;
};

/**
 * Обновить билет.
 * @param ticketId - ID обновляемого билета
 * @param ticketData - Новые данные для билета
 */
export const updateTicket = async (ticketId: number, ticketData: TicketCreate): Promise<Ticket> => {
    const response = await api.put<Ticket>(`/tickets/${ticketId}`, ticketData);
    return response.data;
};

/**
 * Удалить билет по ID.
 * @param ticketId - ID удаляемого билета
 */
export const deleteTicket = async (ticketId: number): Promise<void> => {
    await api.delete(`/tickets/${ticketId}`);
};

/**
 * Удалить все билеты для конкретного матча.
 * @param matchId - ID матча
 */
export const deleteTicketsByMatch = async (matchId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/tickets/match/${matchId}`);
    return response.data;
};


// --- Функции статистики ---

/**
 * Получить статистику по количеству проданных билетов в каждой категории.
 */
export const getTicketStatsByCategory = async (): Promise<Record<string, number>> => {
    const response = await api.get<Record<string, number>>('/tickets/stats/by-category');
    return response.data;
};

/**
 * Получить сводную статистику по ценам (мин, макс, средняя).
 */
export const getTicketPriceSummary = async (): Promise<Record<string, number>> => {
    const response = await api.get<Record<string, number>>('/tickets/stats/price-summary');
    return response.data;
};