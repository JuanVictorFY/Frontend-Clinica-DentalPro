import { UserProfile } from './user.model';

/**
 * Payload de la solicitud de inicio de sesión.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Respuesta del endpoint de autenticación.
 */
export interface LoginResponse {
  token: string;
  user: UserProfile;
}
