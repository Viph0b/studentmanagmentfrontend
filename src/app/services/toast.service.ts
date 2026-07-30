import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  exiting?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toasts$ = new Subject<Toast>();
  private idSeq = 0;

  readonly toasts = this.toasts$.asObservable();

  private add(message: string, type: Toast['type']): void {
    const id = ++this.idSeq;
    this.toasts$.next({ id, message, type });
    setTimeout(() => this.dismiss(id), 4000);
  }

  success(message: string): void {
    this.add(message, 'success');
  }

  error(message: string): void {
    this.add(message, 'error');
  }

  info(message: string): void {
    this.add(message, 'info');
  }

  dismiss(id: number): void {
    this.toasts$.next({ id, message: '', type: 'info', exiting: true });
  }
}
