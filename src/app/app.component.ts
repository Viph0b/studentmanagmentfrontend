import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';

import { ToastService, Toast } from './services/toast.service';
import { ConfirmService, ConfirmOptions } from './services/confirm.service';
import { routeAnimations } from './route-animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  animations: [routeAnimations],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly navItems = [
    { no: '01', label: 'Overview', path: '/', icon: '📊' },
    { no: '02', label: 'Students', path: '/students', icon: '👨‍🎓' },
    { no: '03', label: 'Teachers', path: '/teachers', icon: '👩‍🏫' },
    { no: '04', label: 'Majors', path: '/majors', icon: '📚' },
    { no: '05', label: 'Groups', path: '/groups', icon: '👥' },
    { no: '06', label: 'Class schedule', path: '/schedule', icon: '📅' },
    { no: '07', label: 'Fee payments', path: '/payments', icon: '💳' },
  ];

  sidebarOpen = false;
  toasts: Toast[] = [];
  confirm: (ConfirmOptions & { id: number }) | null = null;

  constructor(
    private toastSvc: ToastService,
    private confirmSvc: ConfirmService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.toastSvc.toasts.pipe(takeUntil(this.destroy$)).subscribe((t) => {
      if (t.exiting) {
        this.toasts = this.toasts.filter((x) => x.id !== t.id);
      } else {
        this.toasts = [...this.toasts, t];
      }
    });

    this.confirmSvc.requests.pipe(takeUntil(this.destroy$)).subscribe((c) => {
      this.confirm = c;
    });

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntil(this.destroy$))
      .subscribe(() => {
        this.sidebarOpen = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  dismissToast(id: number): void {
    this.toastSvc.dismiss(id);
  }

  onConfirm(yes: boolean): void {
    if (this.confirm) {
      this.confirmSvc.resolve(this.confirm.id, yes);
      this.confirm = null;
    }
  }

  getRouteAnimation(outlet: RouterOutlet): string {
    return outlet?.activatedRouteData?.['animation'] ?? 'page';
  }
}
