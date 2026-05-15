import { Pipe, PipeTransform } from '@angular/core';

/**
 * Representa la información visual de un estado de cita.
 */
export interface EstadoCitaDisplay {
  label: string;
  cssClass: string;
}

/**
 * Pipe que transforma el estado de una cita en una etiqueta con clase CSS asociada.
 *
 * Uso en template:
 *   {{ cita.estado | estadoCita }}           → retorna el objeto { label, cssClass }
 *   {{ cita.estado | estadoCita:'label' }}   → retorna solo la etiqueta de texto
 *   {{ cita.estado | estadoCita:'class' }}   → retorna solo la clase CSS
 *
 * Colores:
 *   PENDIENTE  → amarillo (estado-pendiente)
 *   ATENDIDO   → verde (estado-atendido)
 *   CANCELADO  → rojo (estado-cancelado)
 *   REAGENDADO → azul (estado-reagendado)
 */
@Pipe({
  name: 'estadoCita',
  standalone: true,
  pure: true
})
export class EstadoCitaPipe implements PipeTransform {
  private readonly estadoMap: Record<string, EstadoCitaDisplay> = {
    PENDIENTE: { label: 'Pendiente', cssClass: 'estado-pendiente' },
    ATENDIDO: { label: 'Atendido', cssClass: 'estado-atendido' },
    CANCELADO: { label: 'Cancelado', cssClass: 'estado-cancelado' },
    REAGENDADO: { label: 'Reagendado', cssClass: 'estado-reagendado' }
  };

  transform(value: string | null | undefined, field?: 'label' | 'class'): string | EstadoCitaDisplay {
    if (!value) {
      const defaultDisplay: EstadoCitaDisplay = { label: 'Desconocido', cssClass: '' };
      if (field === 'label') return defaultDisplay.label;
      if (field === 'class') return defaultDisplay.cssClass;
      return defaultDisplay;
    }

    const normalized = value.toUpperCase();
    const display = this.estadoMap[normalized] ?? { label: value, cssClass: '' };

    if (field === 'label') return display.label;
    if (field === 'class') return display.cssClass;
    return display;
  }
}
