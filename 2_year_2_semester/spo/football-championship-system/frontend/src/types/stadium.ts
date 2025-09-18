// frontend/src/types/stadium.ts
export interface Stadium { id: number; name: string; city: string; capacity: number; created_at: string; updated_at: string; }
export interface StadiumCreate { name: string; city: string; capacity: number; }
export interface StadiumUpdate { name?: string; city?: string; capacity?: number; }
export interface StadiumStatistics { total_matches: number; finished_matches: number; upcoming_matches: number; cancelled_matches: number; utilization_rate: number; }
export interface StadiumListParams { skip?: number; limit?: number; search?: string; city?: string; min_capacity?: number; max_capacity?: number; }