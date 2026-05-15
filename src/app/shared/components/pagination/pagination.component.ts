import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <nav class="flex items-center justify-center gap-1" aria-label="Paginación">
      <!-- Previous button -->
      <button
        type="button"
        (click)="goToPage(currentPage() - 1)"
        [disabled]="currentPage() <= 1"
        class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Página anterior"
      >
        &laquo; Anterior
      </button>

      <!-- Page numbers -->
      @for (page of visiblePages(); track page) {
        @if (page === -1) {
          <span class="px-3 py-2 text-sm text-gray-500">...</span>
        } @else {
          <button
            type="button"
            (click)="goToPage(page)"
            [class]="page === currentPage()
              ? 'px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg'
              : 'px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition'"
            [attr.aria-current]="page === currentPage() ? 'page' : null"
            [attr.aria-label]="'Página ' + page"
          >
            {{ page }}
          </button>
        }
      }

      <!-- Next button -->
      <button
        type="button"
        (click)="goToPage(currentPage() + 1)"
        [disabled]="currentPage() >= totalPages()"
        class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Página siguiente"
      >
        Siguiente &raquo;
      </button>
    </nav>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();

  readonly pageChange = output<number>();

  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: number[] = [];

    // Always show first page
    pages.push(1);

    if (current > 3) {
      pages.push(-1); // ellipsis
    }

    // Pages around current
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push(-1); // ellipsis
    }

    // Always show last page
    pages.push(total);

    return pages;
  });

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}
