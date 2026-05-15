import { UserRole } from '../../../core/models/user.model';

export interface Usuario {
  id: number;
  nombreCompleto: string;
  email: string;
  rol: UserRole;
  activo: boolean;
}

export interface UsuarioRequest {
  nombreCompleto: string;
  email: string;
  password: string;
  rol: UserRole;
}
