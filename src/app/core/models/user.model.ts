/**
 * Enum de roles de usuario del sistema DentalPro.
 * Define los tres roles con acceso diferenciado a módulos.
 */
export enum UserRole {
  ADMINISTRADOR = 'ADMINISTRADOR',
  RECEPCIONISTA = 'RECEPCIONISTA',
  ODONTOLOGO = 'ODONTOLOGO'
}

/**
 * Perfil del usuario autenticado.
 */
export interface UserProfile {
  id: number;
  nombreCompleto: string;
  email: string;
  rol: UserRole;
}

/**
 * Payload decodificado del token JWT.
 */
export interface TokenPayload {
  sub: string;
  rol: UserRole;
  exp: number;
  iat: number;
}
