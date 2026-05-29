export enum UserRole {
  ADMINISTRADOR = 'ADMINISTRADOR',
  RECEPCIONISTA = 'RECEPCIONISTA',
  ODONTOLOGO = 'ODONTOLOGO',
  PACIENTE = 'PACIENTE'
}

export interface UserProfile {
  id: number;
  nombreCompleto: string;
  email: string;
  rol: UserRole;
}

export interface TokenPayload {
  sub: string;
  rol: string;
  userId: number;
  exp: number;
  iat: number;
}


