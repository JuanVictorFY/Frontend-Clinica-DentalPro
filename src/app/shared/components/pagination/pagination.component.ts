import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <div class="flex items-center justify-between mt-4 px-2">
      <!-- Info text -->
      <p class="text-sm text-gray-400">
        Mostrando {{ startItem() }}-{{ endItem() }} de {{ totalItems() }} registros
      </p>

      <!-- Page buttons -->
      <div class="flex items-center gap-1">
        <button
          (click)="onPageChange(currentPage() - 1)"
          [disabled]="currentPage() === 1"
          [class]="currentPage() === 1 ? btnDisabled : btnNormal"
        >
          «
        </button>

        @for (page of visiblePages(); track page) {
          @if (page === -1) {
            <span class="px-2 py-1.5 text-sm text-gray-500">...</span>
          } @else {
            <button
              (click)="onPageChange(page)"
              [class]="page === currentPage() ? btnActive : btnNormal"
            >
              {{ page }}
            </button>
          }
        }

        <button
          (click)="onPageChange(currentPage() + 1)"
          [disabled]="currentPage() === totalPages()"
          [class]="currentPage() === totalPages() ? btnDisabled : btnNormal"
        >
          »
        </button>
      </div>
    </div>
  `,
  styles: `:host { display: block; }`
})
export class PaginationComponent {
  readonly currentPage = input<number>(1);
  readonly totalItems = input<number>(0);
  readonly pageSize = input<number>(5);

  readonly pageChange = output<number>();

  readonly btnNormal = 'px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer';
  readonly btnActive = 'px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white cursor-pointer';
  readonly btnDisabled = 'px-3 py-1.5 rounded-lg text-sm text-gray-400 opacity-50 cursor-not-allowed';

  readonly totalPages = computed(() =>
    Math.ceil(this.totalItems() / this.pageSize()) || 1
  );

  readonly startItem = computed(() => {
    if (this.totalItems() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly endItem = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.totalItems())
  );

  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: number[] = [];

    if (current <= 3) {
      pages.push(1, 2, 3, 4, -1, total);
    } else if (current >= total - 2) {
      pages.push(1, -1, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, -1, current - 1, current, current + 1, -1, total);
    }

    return pages;
  });

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}
