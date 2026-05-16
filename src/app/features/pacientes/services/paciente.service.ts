import { Injectable, signal, computed } from '@angular/core';
import { Paciente, PacienteRequest } from '../models/paciente.model';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private readonly pacientes = signal<Paciente[]>([
    {
      id: 1,
      nombreCompleto: 'María Elena Rodríguez Huamán',
      dni: '45678912',
      fechaNacimiento: '1985-03-15',
      telefono: '987654321',
      email: 'maria.rodriguez@gmail.com'
    },
    {
      id: 2,
      nombreCompleto: 'Carlos Alberto Quispe Mamani',
      dni: '71234567',
      fechaNacimiento: '1990-07-22',
      telefono: '912345678',
      email: 'carlos.quispe@hotmail.com'
    },
    {
      id: 3,
      nombreCompleto: 'Ana Lucía Fernández Torres',
      dni: '48765432',
      fechaNacimiento: '1978-11-08',
      telefono: '945678123',
      email: 'ana.fernandez@outlook.com'
    },
    {
      id: 4,
      nombreCompleto: 'José Luis Mendoza Vargas',
      dni: '32145678',
      fechaNacimiento: '1995-01-30',
      telefono: '976543210',
      email: 'jose.mendoza@gmail.com'
    },
    {
      id: 5,
      nombreCompleto: 'Rosa María Chávez Díaz',
      dni: '56789123',
      fechaNacimiento: '1982-06-12',
      telefono: '934567890',
      email: 'rosa.chavez@yahoo.com'
    },
    {
      id: 6,
      nombreCompleto: 'Pedro Alejandro Sánchez Flores',
      dni: '67891234',
      fechaNacimiento: '1988-09-25',
      telefono: '956781234',
      email: 'pedro.sanchez@gmail.com'
    },
    {
      id: 7,
      nombreCompleto: 'Lucía Esperanza Paredes Ramos',
      dni: '23456789',
      fechaNacimiento: '1992-04-18',
      telefono: '923456789',
      email: 'lucia.paredes@hotmail.com'
    },
    {
      id: 8,
      nombreCompleto: 'Miguel Ángel Huanca Condori',
      dni: '89012345',
      fechaNacimiento: '1975-12-03',
      telefono: '967890123',
      email: 'miguel.huanca@gmail.com'
    },
    {
      id: 9,
      nombreCompleto: 'Carmen Julia Espinoza León',
      dni: '34567891',
      fechaNacimiento: '1998-02-14',
      telefono: '943210987',
      email: 'carmen.espinoza@outlook.com'
    },
    {
      id: 10,
      nombreCompleto: 'Fernando Daniel Castillo Rojas',
      dni: '78901234',
      fechaNacimiento: '1980-08-07',
      telefono: '918765432',
      email: 'fernando.castillo@gmail.com'
    }
  ]);

  private nextId = 11;

  /** Retorna la lista completa de pacientes */
  listar(): Paciente[] {
    return this.pacientes();
  }

  /** Filtra pacientes por nombre o DNI (case insensitive) */
  buscar(query: string): Paciente[] {
    if (!query || query.trim() === '') {
      return this.pacientes();
    }
    const term = query.toLowerCase().trim();
    return this.pacientes().filter(
      p => p.nombreCompleto.toLowerCase().includes(term) || p.dni.includes(term)
    );
  }

  /** Obtiene un paciente por su ID */
  obtenerPorId(id: number): Paciente | undefined {
    return this.pacientes().find(p => p.id === id);
  }

  /** Registra un nuevo paciente */
  registrar(paciente: PacienteRequest): void {
    const nuevo: Paciente = {
      ...paciente,
      id: this.nextId++
    };
    this.pacientes.update(list => [...list, nuevo]);
  }

  /** Actualiza un paciente existente */
  actualizar(id: number, paciente: PacienteRequest): void {
    this.pacientes.update(list =>
      list.map(p => p.id === id ? { ...p, ...paciente } : p)
    );
  }

  /** Elimina un paciente por su ID */
  eliminar(id: number): void {
    this.pacientes.update(list => list.filter(p => p.id !== id));
  }

  /** Verifica si un DNI ya existe (excluye un ID específico para modo edición) */
  existeDni(dni: string, excludeId?: number): boolean {
    return this.pacientes().some(p => p.dni === dni && p.id !== excludeId);
  }
}
