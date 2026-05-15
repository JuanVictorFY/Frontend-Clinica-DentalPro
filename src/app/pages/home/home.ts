import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  @ViewChild('statsSection') statsSection!: ElementRef;

  private scrollInterval: any;
  private scrollObserver: IntersectionObserver | null = null;
  private statsObserver: IntersectionObserver | null = null;
  private platformId = inject(PLATFORM_ID);
  private statsAnimated = false;

  // Animated counter signals
  statPatients = signal(0);
  statYears = signal(0);
  statSpecialists = signal(0);
  statSatisfaction = signal(0);

  ngAfterViewInit() {
    this.startAutoScroll();
    this.setupScrollAnimations();
    this.setupStatsCounter();
  }

  ngOnDestroy() {
    this.stopAutoScroll();
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }
    if (this.statsObserver) {
      this.statsObserver.disconnect();
    }
  }

  setupScrollAnimations() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            this.scrollObserver?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach((el) => {
      this.scrollObserver?.observe(el);
    });
  }

  setupStatsCounter() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.statsSection) return;

    this.statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.statsAnimated) {
            this.statsAnimated = true;
            this.countUp(this.statPatients, 5000, 2000);
            this.countUp(this.statYears, 14, 1500);
            this.countUp(this.statSpecialists, 12, 1500);
            this.countUp(this.statSatisfaction, 98, 1800);
            this.statsObserver?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    this.statsObserver.observe(this.statsSection.nativeElement);
  }

  countUp(signalRef: ReturnType<typeof signal<number>>, target: number, duration: number) {
    const startTime = performance.now();
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      signalRef.set(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
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
