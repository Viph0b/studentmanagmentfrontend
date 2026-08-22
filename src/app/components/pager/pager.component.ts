import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pager" *ngIf="totalPages > 1">
      <div class="pager-pages">
        <button
          class="btn btn-ghost btn-sm"
          [disabled]="page <= 1"
          (click)="go(page - 1)"
        >
          ← Prev
        </button>
        <ng-container *ngFor="let p of pages; trackBy: trackByPage">
          <button
            class="btn btn-sm page-num"
            [class.btn-primary]="p === page"
            [class.btn-ghost]="p !== page"
            [disabled]="p === page"
            (click)="go(p)"
          >
            {{ p }}
          </button>
        </ng-container>
        <button
          class="btn btn-ghost btn-sm"
          [disabled]="page >= totalPages"
          (click)="go(page + 1)"
        >
          Next →
        </button>
      </div>
      <div class="pager-size">
        <span>{{ total }} records</span>
        <select [ngModel]="pageSize" (ngModelChange)="pageSizeChange.emit($event)">
          <option *ngFor="let n of sizeOptions; trackBy: trackByNumber" [ngValue]="n">{{ n }} / page</option>
        </select>
      </div>
    </div>
  `,
})
export class PagerComponent {
  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() total = 0;
  @Input() pageSize = 20;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  readonly sizeOptions = [10, 20, 50];

  get pages(): number[] {
    const total = this.totalPages;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const current = this.page;
    const start = Math.max(1, Math.min(current - 3, total - 6));
    return Array.from({ length: 7 }, (_, i) => start + i);
  }

  go(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.pageChange.emit(p);
  }

  trackByPage(_index: number, p: number): number {
    return p;
  }

  trackByNumber(_index: number, n: number): number {
    return n;
  }
}