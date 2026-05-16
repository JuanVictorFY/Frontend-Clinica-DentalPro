import { Component, inject, signal, OnInit, input } from '@angular/core';
import { Router } from '@angular/router';
import { ReporteService } from '../services/reporte.service';
import { Reporte } from '../models/reporte.model';

@Component({
  selector: 'app-reporte-detalle',
  standalone: true,
  template: `
    <div class="space-y-6">
      <!-- Botón volver -->
      <button
        (click)="volver()"
        class="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
      >
        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Volver a reportes
      </button>

      @if (reporte()) {
        <div class="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-6">
          <!-- Título -->
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-white">Detalle del Reporte</h1>
            <button
              (click)="descargarPdf()"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500 text-blue-400 hover:bg-blue-500/10 transition-colors text-sm font-medium cursor-pointer"
            >
              <svg class="w-4.5 h-4.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Descargar PDF
            </button>
          </div>

          <!-- Campos -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Fecha</p>
              <p class="text-gray-200">{{ reporte()!.fecha }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Paciente</p>
              <p class="text-gray-200">{{ reporte()!.pacienteNombre }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Odontólogo</p>
              <p class="text-gray-200">{{ reporte()!.odontologoNombre }}</p>
            </div>
          </div>

          <div class="border-t border-gray-700 pt-6 space-y-5">
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Diagnóstico</p>
              <p class="text-gray-200 whitespace-pre-line">{{ reporte()!.diagnostico }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Tratamiento</p>
              <p class="text-gray-200 whitespace-pre-line">{{ reporte()!.tratamiento }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Observaciones</p>
              <p class="text-gray-200 whitespace-pre-line">{{ reporte()!.observaciones }}</p>
            </div>
          </div>
        </div>
      } @else {
        <div class="w-full rounded-xl border border-gray-700 bg-gray-900 p-8 flex flex-col items-center justify-center gap-3">
          <p class="text-gray-400 text-sm">Reporte no encontrado</p>
        </div>
      }
    </div>
  `,
  styles: `:host { display: block; }`
})
export class ReporteDetalleComponent implements OnInit {
  private readonly reporteService = inject(ReporteService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();
  readonly reporte = signal<Reporte | undefined>(undefined);

  ngOnInit(): void {
    const reporteId = Number(this.id());
    if (!isNaN(reporteId)) {
      this.reporte.set(this.reporteService.obtenerPorId(reporteId));
    }
  }

  volver(): void {
    this.router.navigate(['/intranet/reportes']);
  }

  descargarPdf(): void {
    const reporte = this.reporte();
    if (!reporte) return;

    const contenido = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Reporte - ${reporte.pacienteNombre}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 800; color: #1e293b; }
          .logo span { color: #2563eb; }
          .fecha-reporte { font-size: 12px; color: #64748b; }
          .titulo { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 24px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
          .info-item label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 4px; font-weight: 600; }
          .info-item p { font-size: 14px; color: #1e293b; font-weight: 500; }
          .seccion { margin-bottom: 24px; }
          .seccion-titulo { font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #2563eb; font-weight: 700; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
          .seccion-contenido { font-size: 14px; color: #334155; white-space: pre-line; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Dental<span>Pro</span></div>
          <div class="fecha-reporte">Generado: ${new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>

        <h1 class="titulo">Reporte de Atencion Clinica</h1>

        <div class="info-grid">
          <div class="info-item">
            <label>Paciente</label>
            <p>${reporte.pacienteNombre}</p>
          </div>
          <div class="info-item">
            <label>Odontologo</label>
            <p>${reporte.odontologoNombre}</p>
          </div>
          <div class="info-item">
            <label>Fecha de Atencion</label>
            <p>${reporte.fecha}</p>
          </div>
          <div class="info-item">
            <label>ID Reporte</label>
            <p>#${reporte.id}</p>
          </div>
        </div>

        <div class="seccion">
          <div class="seccion-titulo">Diagnostico</div>
          <div class="seccion-contenido">${reporte.diagnostico}</div>
        </div>

        <div class="seccion">
          <div class="seccion-titulo">Tratamiento Realizado</div>
          <div class="seccion-contenido">${reporte.tratamiento}</div>
        </div>

        <div class="seccion">
          <div class="seccion-titulo">Observaciones</div>
          <div class="seccion-contenido">${reporte.observaciones || 'Sin observaciones'}</div>
        </div>

        <div class="footer">
          DentalPro - Sistema de Gestion Clinica Dental | Documento generado automaticamente
        </div>
      </body>
      </html>
    `;

    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(contenido);
      ventana.document.close();
      ventana.focus();
      // Esperar a que el contenido se renderice antes de imprimir
      setTimeout(() => {
        ventana.print();
      }, 300);
    }
  }
}
