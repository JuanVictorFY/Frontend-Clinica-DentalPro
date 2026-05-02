import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit, OnDestroy {
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
      el.scrollTo({ left: 0, behavior: 'smooth' }); // Vuelve al inicio
    } else {
      el.scrollBy({ left: 350, behavior: 'smooth' }); // Avanza una tarjeta
    }
  }

  manualScroll() {
    this.scrollNext();
    this.stopAutoScroll();
    this.startAutoScroll(); // Reinicia el temporizador
  }
}
