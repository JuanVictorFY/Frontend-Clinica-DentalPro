import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { PaginationComponent } from './pagination.component';

@Component({
  standalone: true,
  imports: [PaginationComponent],
  template: `<app-pagination [currentPage]="currentPage()" [totalPages]="totalPages()" (pageChange)="onPageChange($event)" />`
})
class TestHostComponent {
  currentPage = signal(1);
  totalPages = signal(5);
  lastPageChange: number | null = null;

  onPageChange(page: number): void {
    this.lastPageChange = page;
  }
}

describe('PaginationComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render pagination controls', () => {
    const nav = fixture.nativeElement.querySelector('nav[aria-label="Paginación"]');
    expect(nav).toBeTruthy();
  });

  it('should disable previous button on first page', () => {
    host.currentPage.set(1);
    fixture.detectChanges();

    const prevButton = fixture.nativeElement.querySelector('button[aria-label="Página anterior"]');
    expect(prevButton.disabled).toBe(true);
  });

  it('should enable previous button when not on first page', () => {
    host.currentPage.set(3);
    fixture.detectChanges();

    const prevButton = fixture.nativeElement.querySelector('button[aria-label="Página anterior"]');
    expect(prevButton.disabled).toBe(false);
  });

  it('should disable next button on last page', () => {
    host.currentPage.set(5);
    fixture.detectChanges();

    const nextButton = fixture.nativeElement.querySelector('button[aria-label="Página siguiente"]');
    expect(nextButton.disabled).toBe(true);
  });

  it('should enable next button when not on last page', () => {
    host.currentPage.set(3);
    fixture.detectChanges();

    const nextButton = fixture.nativeElement.querySelector('button[aria-label="Página siguiente"]');
    expect(nextButton.disabled).toBe(false);
  });

  it('should display all page numbers when totalPages <= 7', () => {
    host.totalPages.set(5);
    fixture.detectChanges();

    const allButtons = fixture.nativeElement.querySelectorAll('button');
    // Total buttons = prev + 5 page numbers + next = 7
    // Exclude prev and next buttons
    const pageButtons = Array.from(allButtons).filter((btn: any) => {
      const label = btn.getAttribute('aria-label') || '';
      return label.match(/^Página \d+$/);
    });
    expect(pageButtons.length).toBe(5);
  });

  it('should emit pageChange when clicking a page number', () => {
    host.currentPage.set(1);
    fixture.detectChanges();

    const page3Button = fixture.nativeElement.querySelector('button[aria-label="Página 3"]');
    page3Button.click();
    fixture.detectChanges();

    expect(host.lastPageChange).toBe(3);
  });

  it('should emit pageChange when clicking next button', () => {
    host.currentPage.set(2);
    fixture.detectChanges();

    const nextButton = fixture.nativeElement.querySelector('button[aria-label="Página siguiente"]');
    nextButton.click();
    fixture.detectChanges();

    expect(host.lastPageChange).toBe(3);
  });

  it('should emit pageChange when clicking previous button', () => {
    host.currentPage.set(3);
    fixture.detectChanges();

    const prevButton = fixture.nativeElement.querySelector('button[aria-label="Página anterior"]');
    prevButton.click();
    fixture.detectChanges();

    expect(host.lastPageChange).toBe(2);
  });

  it('should not emit pageChange when clicking the current page', () => {
    host.currentPage.set(2);
    host.lastPageChange = null;
    fixture.detectChanges();

    const currentPageButton = fixture.nativeElement.querySelector('button[aria-current="page"]');
    currentPageButton.click();
    fixture.detectChanges();

    expect(host.lastPageChange).toBeNull();
  });

  it('should highlight the current page with aria-current', () => {
    host.currentPage.set(3);
    fixture.detectChanges();

    const currentPageButton = fixture.nativeElement.querySelector('button[aria-current="page"]');
    expect(currentPageButton).toBeTruthy();
    expect(currentPageButton.textContent.trim()).toBe('3');
  });

  it('should show ellipsis for many pages', () => {
    host.totalPages.set(10);
    host.currentPage.set(5);
    fixture.detectChanges();

    const ellipsis = fixture.nativeElement.querySelectorAll('span');
    expect(ellipsis.length).toBeGreaterThan(0);
    expect(ellipsis[0].textContent.trim()).toBe('...');
  });
});
