// Основные типы данных, соответствующие схемам бэкенда

export interface Team {
  id: number;
  name: string;
  city: string;
  coach: string;
  last_season_place: number;
  created_at: string;
  updated_at: string;
}

export interface TeamCreate {
  name: string;
  city: string;
  coach: string;
  last_season_place: number;
}

export interface TeamUpdate {
  name?: string;
  city?: string;
  coach?: string;
  last_season_place?: number;
}

export interface Player {
  id: number;
  team_id: number;
  first_name: string;
  last_name: string;
  age: number;
  jersey_number: number;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  created_at: string;
  updated_at: string;
}

export interface PlayerCreate {
  team_id: number;
  first_name: string;
  last_name: string;
  age: number;
  jersey_number: number;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
}

export interface PlayerUpdate {
  first_name?: string;
  last_name?: string;
  age?: number;
  jersey_number?: number;
  position?: 'GK' | 'DEF' | 'MID' | 'FWD';
  team_id?: number;
}

export interface PlayerWithTeam extends Player {
  team: Team;
}

export interface Stadium {
  id: number;
  name: string;
  city: string;
  capacity: number;
  created_at: string;
  updated_at: string;
}

export interface StadiumCreate {
  name: string;
  city: string;
  capacity: number;
}

export interface StadiumUpdate {
  name?: string;
  city?: string;
  capacity?: number;
}

export interface Match {
  id: number;
  date: string;
  home_team_id: number;
  away_team_id: number;
  stadium_id: number;
  home_goals?: number;
  away_goals?: number;
  status: 'scheduled' | 'finished' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface MatchCreate {
  date: string;
  home_team_id: number;
  away_team_id: number;
  stadium_id: number;
}

export interface MatchUpdate {
  date?: string;
  home_team_id?: number;
  away_team_id?: number;
  stadium_id?: number;
  home_goals?: number;
  away_goals?: number;
  status?: 'scheduled' | 'finished' | 'cancelled';
}

export interface MatchResult {
  home_goals: number;
  away_goals: number;
}

export interface MatchWithDetails extends Match {
  home_team: Team;
  away_team: Team;
  stadium: Stadium;
}

export interface Ticket {
  id: number;
  match_id: number;
  category: 'VIP' | 'Standard' | 'Economy';
  price: number;
  created_at: string;
  updated_at: string;
}

export interface TicketCreate {
  match_id: number;
  category: 'VIP' | 'Standard' | 'Economy';
  price: number;
}

export interface TicketCalculationRequest {
  home_team_id: number;
  away_team_id: number;
  stadium_id: number;
  category: 'VIP' | 'Standard' | 'Economy';
}

export interface TicketCalculationResponse {
  category: string;
  price: number;
  base_price: number;
  prestige_coefficient: number;
  category_multiplier: number;
}

export interface TicketWithMatch extends Ticket {
  match: MatchWithDetails;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'manager';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager';
  is_active?: boolean;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'manager';
  is_active?: boolean;
}

// Типы для аутентификации
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export interface TokenData {
  username?: string;
  user_id?: number;
  role?: string;
  expires?: string;
}

// Типы для турнирной таблицы и отчетов
export interface TournamentStanding {
  team_id: number;
  team_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  position: number;
}

export interface TeamStatistics {
  team_id: number;
  team_name: string;
  total_matches: number;
  home_matches: number;
  away_matches: number;
  wins: number;
  draws: number;
  losses: number;
  goals_scored: number;
  goals_conceded: number;
  clean_sheets: number;
  biggest_win: string;
  biggest_loss: string;
  current_form: string[];
}

// Общие типы для API ответов
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  detail: string;
  status_code: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Типы для форм
export interface FormValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: FormValidationError[];
  isLoading: boolean;
  isValid: boolean;
}

// Типы для UI состояний
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface TableColumn<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  onRowClick?: (record: T) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize?: number) => void;
  };
}

// Типы для фильтров и поиска
export interface FilterOption {
  label: string;
  value: string | number;
}

export interface SearchFilter {
  field: string;
  operator: 'eq' | 'like' | 'gt' | 'lt' | 'in';
  value: any;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface QueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  filters?: SearchFilter[];
  sort?: SortOption;
}

// Типы для уведомлений
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Типы для контекстов
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Константы для типов
export const PLAYER_POSITIONS = ['GK', 'DEF', 'MID', 'FWD'] as const;
export const TICKET_CATEGORIES = ['VIP', 'Standard', 'Economy'] as const;
export const MATCH_STATUSES = ['scheduled', 'finished', 'cancelled'] as const;
export const USER_ROLES = ['admin', 'manager'] as const;

// Утилитарные типы
export type PlayerPosition = typeof PLAYER_POSITIONS[number];
export type TicketCategory = typeof TICKET_CATEGORIES[number];
export type MatchStatus = typeof MATCH_STATUSES[number];
export type UserRole = typeof USER_ROLES[number];