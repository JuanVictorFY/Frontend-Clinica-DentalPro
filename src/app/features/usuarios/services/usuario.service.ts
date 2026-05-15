import { Injectable, signal } from '@angular/core';
import { UserRole } from '../../../core/models/user.model';
import { Usuario, UsuarioRequest } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly usuarios = signal<Usuario[]>([
    {
      id: 1,
      nombreCompleto: 'Dr. Admin Principal',
      email: 'admin@dentalpro.com',
      rol: UserRole.ADMIN,
      activo: true
    },
    {
      id: 2,
      nombreCompleto: 'María López García',
      email: 'recepcion@dentalpro.com',
      rol: UserRole.RECEPCIONISTA,
      activo: true
    },
    {
      id: 3,
      nombreCompleto: 'Dr. Carlos Mendoza',
      email: 'doctor@dentalpro.com',
      rol: UserRole.ODONTOLOGO,
      activo: true
    },
    {
      id: 4,
      nombreCompleto: 'Ana Sofía Ramírez',
      email: 'ana.ramirez@dentalpro.com',
      rol: UserRole.RECEPCIONISTA,
      activo: false
    },
    {
      id: 5,
      nombreCompleto: 'Dra. Patricia Huamán',
      email: 'patricia.huaman@dentalpro.com',
      rol: UserRole.ODONTOLOGO,
      activo: true
    }
  ]);

  private nextId = 6;

  /** Retorna la lista completa de usuarios */
  listar(): Usuario[] {
    return this.usuarios();
  }

  /** Obtiene un usuario por su ID */
  obtenerPorId(id: number): Usuario | undefined {
    return this.usuarios().find(u => u.id === id);
  }

  /** Registra un nuevo usuario */
  registrar(usuario: UsuarioRequest): void {
    const nuevo: Usuario = {
      id: this.nextId++,
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email,
      rol: usuario.rol,
      activo: true
    };
    this.usuarios.update(list => [...list, nuevo]);
  }

  /** Actualiza un usuario existente */
  actualizar(id: number, usuario: UsuarioRequest): void {
    this.usuarios.update(list =>
      list.map(u => u.id === id ? {
        ...u,
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
        rol: usuario.rol
      } : u)
    );
  }

  /** Elimina un usuario por su ID */
  eliminar(id: number): void {
    this.usuarios.update(list => list.filter(u => u.id !== id));
  }
}
