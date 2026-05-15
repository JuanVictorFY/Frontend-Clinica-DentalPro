export enum UserRole {
  ADMIN = 'ADMIN',
  RECEPCIONISTA = 'RECEPCIONISTA',
  ODONTOLOGO = 'ODONTOLOGO'
}

export interface UserProfile {
  id: number;
  nombreCompleto: string;
  email: string;
  rol: UserRole;
}

export interface TokenPayload {
  sub: string;
  rol: UserRole;
  exp: number;
  iat: number;
}
