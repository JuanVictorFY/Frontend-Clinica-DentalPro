import {
  Component, inject, signal, OnInit, OnDestroy,
  PLATFORM_ID, ElementRef, viewChild, effect
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DashboardService, AdminStats } from '../dashboard.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-charts',
  standalone: true,
  template: `
    <div class="space-y-6">

      <!-- Fila superior -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Donut: Citas por Estado -->
        <div class="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <div class="flex items-center justify-between mb-1">
            <h3 class="text-base font-semibold text-white">Citas por Estado</h3>
            <span class="text-xs text-gray-400 bg-gray-800 px-2.5 py-1 rounded-full">{{ mes() }}</span>
          </div>
          <p class="text-xs text-gray-500 mb-5">Distribución del mes actual</p>

          <div class="flex items-center gap-6">
            <div class="relative w-44 h-44 shrink-0">
              <!-- Spinner superpuesto mientras carga -->
              @if (loading()) {
                <div class="absolute inset-0 flex items-center justify-center z-10">
                  <div class="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                </div>
              }
              <!-- Canvas siempre en el DOM -->
              <canvas #donutCanvas [style.opacity]="loading() ? '0' : '1'"></canvas>
              @if (!loading()) {
                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span class="text-2xl font-bold text-white">{{ totalCitasMes() }}</span>
                  <span class="text-xs text-gray-400">total</span>
                </div>
              }
            </div>

            <div class="flex flex-col gap-2.5 flex-1">
              @if (loading()) {
                @for (_ of [1,2,3,4]; track $index) {
                  <div class="h-4 bg-gray-800 rounded animate-pulse"></div>
                }
              } @else {
                @for (item of legendItems(); track item.label) {
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full shrink-0" [style.background]="item.color"></span>
                      <span class="text-xs text-gray-300">{{ item.label }}</span>
                    </div>
                    <span class="text-xs font-semibold text-white">{{ item.value }}</span>
                  </div>
                }
              }
            </div>
          </div>
        </div>

        <!-- Barras: Citas por Odontólogo -->
        <div class="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <div class="flex items-center justify-between mb-1">
            <h3 class="text-base font-semibold text-white">Citas por Odontólogo</h3>
            <span class="text-xs text-gray-400 bg-gray-800 px-2.5 py-1 rounded-full">{{ mes() }}</span>
          </div>
          <p class="text-xs text-gray-500 mb-5">Total de citas asignadas</p>

          <div class="relative h-52">
            @if (loading()) {
              <div class="absolute inset-0 flex items-center justify-center z-10">
                <div class="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
              </div>
            }
            <canvas #barCanvas [style.opacity]="loading() ? '0' : '1'"></canvas>
          </div>
        </div>
      </div>

      <!-- Línea: Últimos 7 días -->
      <div class="bg-gray-900 border border-gray-700 rounded-2xl p-6">
        <div class="flex items-center justify-between mb-1">
          <h3 class="text-base font-semibold text-white">Actividad — Últimos 7 Días</h3>
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            <span class="text-xs text-gray-400">Citas totales</span>
          </div>
        </div>
        <p class="text-xs text-gray-500 mb-5">Número de citas registradas por día</p>

        <div class="relative h-48">
          @if (loading()) {
            <div class="absolute inset-0 flex items-center justify-center z-10">
              <div class="w-10 h-10 rounded-full border-2 border-green-500 border-t-transparent animate-spin"></div>
            </div>
          }
          <canvas #lineCanvas [style.opacity]="loading() ? '0' : '1'"></canvas>
        </div>
      </div>

    </div>
  `,
  styles: `:host { display: block; }`
})
export class AdminChartsComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly dashboardService = inject(DashboardService);

  readonly donutCanvas = viewChild<ElementRef<HTMLCanvasElement>>('donutCanvas');
  readonly barCanvas   = viewChild<ElementRef<HTMLCanvasElement>>('barCanvas');
  readonly lineCanvas  = viewChild<ElementRef<HTMLCanvasElement>>('lineCanvas');

  readonly loading       = signal(true);
  readonly stats         = signal<AdminStats | null>(null);
  readonly totalCitasMes = signal(0);
  readonly mes           = signal('');
  readonly legendItems   = signal<{ label: string; color: string; value: number }[]>([]);

  private readonly charts: Chart[] = [];
  private chartsInitialized = false;

  private readonly COLORS = {
    PENDIENTE:  { bg: 'rgba(245,158,11,0.85)',  border: '#F59E0B' },
    ATENDIDO:   { bg: 'rgba(16,185,129,0.85)',  border: '#10B981' },
    CANCELADO:  { bg: 'rgba(239,68,68,0.85)',   border: '#EF4444' },
    REAGENDADO: { bg: 'rgba(99,102,241,0.85)',  border: '#6366F1' },
  } as const;

  constructor() {
    // Inicializar gráficos cuando los datos lleguen y los canvas ya estén en el DOM
    effect(() => {
      const data = this.stats();
      if (!data || this.chartsInitialized || !isPlatformBrowser(this.platformId)) return;
      this.chartsInitialized = true;
      // setTimeout 0 garantiza que el DOM ya está pintado antes de dibujar
      setTimeout(() => this.buildAllCharts(data), 0);
    });
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.dashboardService.cargarStatsAdmin().subscribe({
      next: (data) => {
        const porEstado = data.porEstado as Record<string, number>;
        this.totalCitasMes.set(Number(data.totalCitasMes));
        this.mes.set(this.capitalize(data.mes));
        this.legendItems.set([
          { label: 'Pendientes',  color: this.COLORS.PENDIENTE.border,  value: porEstado['PENDIENTE']  ?? 0 },
          { label: 'Atendidas',   color: this.COLORS.ATENDIDO.border,   value: porEstado['ATENDIDO']   ?? 0 },
          { label: 'Canceladas',  color: this.COLORS.CANCELADO.border,  value: porEstado['CANCELADO']  ?? 0 },
          { label: 'Reagendadas', color: this.COLORS.REAGENDADO.border, value: porEstado['REAGENDADO'] ?? 0 },
        ]);
        this.loading.set(false);
        // Establecer stats DESPUÉS de loading=false para que el effect vea canvases ya visibles
        this.stats.set(data);
      },
      error: () => this.loading.set(false)
    });
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
  }

  private capitalize(s: string) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  private buildAllCharts(data: AdminStats): void {
    const porEstado    = data.porEstado as Record<string, number>;
    const porOdontologo = data.porOdontologo as { nombre: string; total: number }[];
    const dias          = data.ultimos7Dias  as { fecha: string; dia: string; total: number }[];
    this.buildDonut(porEstado);
    this.buildBar(porOdontologo);
    this.buildLine(dias);
  }

  private buildDonut(porEstado: Record<string, number>): void {
    const el = this.donutCanvas()?.nativeElement;
    if (!el) return;
    const c = new Chart(el, {
      type: 'doughnut',
      data: {
        labels: ['Pendientes', 'Atendidas', 'Canceladas', 'Reagendadas'],
        datasets: [{
          data: [
            porEstado['PENDIENTE']  ?? 0,
            porEstado['ATENDIDO']   ?? 0,
            porEstado['CANCELADO']  ?? 0,
            porEstado['REAGENDADO'] ?? 0,
          ],
          backgroundColor: [
            this.COLORS.PENDIENTE.bg, this.COLORS.ATENDIDO.bg,
            this.COLORS.CANCELADO.bg, this.COLORS.REAGENDADO.bg,
          ],
          borderColor: [
            this.COLORS.PENDIENTE.border, this.COLORS.ATENDIDO.border,
            this.COLORS.CANCELADO.border, this.COLORS.REAGENDADO.border,
          ],
          borderWidth: 2,
          hoverOffset: 6,
          borderRadius: 4,
        }]
      },
      options: {
        cutout: '72%',
        responsive: true,
        maintainAspectRatio: true,
        animation: { duration: 700 },
        plugins: { legend: { display: false }, tooltip: { callbacks: {
          label: ctx => ` ${ctx.label}: ${ctx.parsed}`
        }}}
      }
    });
    this.charts.push(c);
  }

  private buildBar(porOdontologo: { nombre: string; total: number }[]): void {
    const el = this.barCanvas()?.nativeElement;
    if (!el) return;

    const names  = porOdontologo.map(o => o.nombre);
    const totals = porOdontologo.map(o => Number(o.total));
    const barColors = ['rgba(99,102,241,0.8)', 'rgba(168,85,247,0.8)', 'rgba(59,130,246,0.8)', 'rgba(20,184,166,0.8)'];

    const c = new Chart(el, {
      type: 'bar',
      data: {
        labels: names,
        datasets: [{
          label: 'Citas',
          data: totals,
          backgroundColor: names.map((_, i) => barColors[i % barColors.length]),
          borderColor: 'transparent',
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 700 },
        plugins: { legend: { display: false } },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { color: '#9CA3AF', stepSize: 1, precision: 0 },
            grid: { color: 'rgba(75,85,99,0.3)' },
            border: { color: 'transparent' },
          },
          y: {
            ticks: { color: '#D1D5DB', font: { size: 11 } },
            grid: { display: false },
            border: { color: 'transparent' },
          }
        }
      }
    });
    this.charts.push(c);
  }

  private buildLine(dias: { fecha: string; dia: string; total: number }[]): void {
    const el = this.lineCanvas()?.nativeElement;
    if (!el) return;

    const labels = dias.map(d => this.capitalize(d.dia));
    const data   = dias.map(d => Number(d.total));

    const c = new Chart(el, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Citas',
          data,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59,130,246,0.12)',
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#1e40af',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.4,
          fill: true,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 700 },
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: '#9CA3AF', font: { size: 12 } },
            grid: { color: 'rgba(75,85,99,0.3)' },
            border: { color: 'transparent' },
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#9CA3AF', stepSize: 1, precision: 0 },
            grid: { color: 'rgba(75,85,99,0.3)' },
            border: { color: 'transparent' },
          }
        }
      }
    });
    this.charts.push(c);
  }
}

