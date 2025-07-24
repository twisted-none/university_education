// frontend/src/types/auth.ts

/**
 * Интерфейс для данных, отправляемых при логине.
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Интерфейс для данных, отправляемых при регистрации.
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}