import { UserRole } from '../../../core/models/user.model';

/**
 * Representa un usuario del sistema DentalPro.
 * Contiene la información completa retornada por la API.
 */
export interface Usuario {
  id: number;
  nombreCompleto: string;
  email: string;
  rol: UserRole;
  activo: boolean;
}

/**
 * Payload para crear o actualizar un usuario.
 * Se envía al backend en operaciones de registro y edición.
 */
export interface UsuarioRequest {
  nombreCompleto: string;
  email: string;
  password: string;
  rol: UserRole;
}
