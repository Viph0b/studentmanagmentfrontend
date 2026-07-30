import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly request$ = new Subject<ConfirmOptions & { id: number }>();
  private readonly responseMap = new Map<number, Subject<boolean>>();

  readonly requests = this.request$.asObservable();

  confirm(options: ConfirmOptions): Observable<boolean> {
    const id = Date.now() + Math.random();
    const sub = new Subject<boolean>();
    this.responseMap.set(id, sub);
    this.request$.next({ ...options, id });
    return sub.asObservable();
  }

  resolve(id: number, value: boolean): void {
    const sub = this.responseMap.get(id);
    if (sub) {
      sub.next(value);
      sub.complete();
      this.responseMap.delete(id);
    }
  }
}
