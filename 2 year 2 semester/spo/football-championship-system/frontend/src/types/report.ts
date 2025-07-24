// frontend/src/types/report.ts

/**
 * Интерфейс для одной строки в турнирной таблице.
 * Соответствует схеме `TeamStanding` в Pydantic.
 */
export interface TeamStanding {
  position: number;
  team_id: number;
  team_name: string;
  team_city: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_scored: number;
  goals_conceded: number;
  goal_difference: number;
  points: number;
}

/**
 * Интерфейс для всей турнирной таблицы.
 * Соответствует схеме `TournamentTable` в Pydantic.
 */
export interface TournamentTable {
  standings: TeamStanding[];
  last_updated: string; // Даты из API приходят как строки в формате ISO
}

/**
 * Интерфейс для статистики по матчам.
 * Соответствует схеме `MatchStatistics` в Pydantic.
 */
export interface MatchStatistics {
  total_matches: number;
  finished_matches: number;
  scheduled_matches: number;
  cancelled_matches: number;
  total_goals: number;
  average_goals_per_match: number;
  highest_scoring_match: Record<string, any> | null;
}

/**
 * Интерфейс для статистики по команде.
 * Соответствует схеме `TeamStatistics` в Pydantic.
 */
export interface TeamStatistics {
  team_id: number;
  team_name: string;
  home_matches: number;
  away_matches: number;
  home_wins: number;
  away_wins: number;
  home_draws: number;
  away_draws: number;
  home_losses: number;
  away_losses: number;
  home_goals_scored: number;
  away_goals_scored: number;
  home_goals_conceded: number;
  away_goals_conceded: number;
  current_form: ('W' | 'D' | 'L')[];
}

/**
 * Интерфейс для самых результативных команд.
 * Соответствует схеме `TopScorer` в Pydantic.
 */
export interface TopScorer {
  team_id: number;
  team_name: string;
  total_goals: number;
  matches_played: number;
  goals_per_match: number;
}

/**
 * Интерфейс для общей статистики турнира.
 * Соответствует схеме `GeneralStatistics` в Pydantic.
 */
export interface GeneralStatistics {
  total_teams: number;
  total_matches: number;
  finished_matches: number;
  total_goals: number;
  average_goals_per_match: number;
  top_scoring_teams: TopScorer[];
  match_statistics: MatchStatistics;
}

/**
 * Интерфейс для отчета по всему сезону.
 * Соответствует схеме `SeasonSummary` в Pydantic.
 */
export interface SeasonSummary {
  tournament_table: TournamentTable;
  general_statistics: GeneralStatistics;
  generated_at: string;
}

/**
 * Интерфейс для анализа очных встреч.
 */
export interface HeadToHeadAnalysis {
  total_matches: number;
  team1_wins: number;
  team2_wins: number;
  draws: number;
  team1_goals: number;
  team2_goals: number;
}

/**
 * Интерфейс для сравнения двух команд.
 */
export interface TeamComparisonReport {
    team1_stats: TeamStatistics;
    team2_stats: TeamStatistics;
}