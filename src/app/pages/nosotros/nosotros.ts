import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.css',
})
export class Nosotros implements AfterViewInit, OnDestroy {
  @ViewChild('carousel') carousel!: ElementRef;
  private scrollInterval: any;

  ngAfterViewInit() {
    this.startAutoScroll();
  }

  ngOnDestroy() {
    this.stopAutoScroll();
  }

  startAutoScroll() {
    this.scrollInterval = setInterval(() => this.scrollNext(), 3500);
  }

  stopAutoScroll() {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
  }

  scrollNext() {
    if (!this.carousel) return;
    const el = this.carousel.nativeElement;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 50) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: 350, behavior: 'smooth' });
    }
  }

  manualScroll() {
    this.scrollNext();
    this.stopAutoScroll();
    this.startAutoScroll();
  }
}
