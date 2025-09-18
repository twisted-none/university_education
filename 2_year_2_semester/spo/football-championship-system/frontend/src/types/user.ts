// frontend/src/types/user.ts
export interface User { id: number; username: string; email: string; role: 'admin' | 'manager'; }
export interface Token { access_token: string; token_type: string; }