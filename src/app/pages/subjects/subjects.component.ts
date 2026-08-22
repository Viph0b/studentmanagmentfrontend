import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PagerComponent } from '../../components/pager/pager.component';
import { IconComponent } from '../../components/icon/icon.component';
import { SubjectService } from '../../services/subject.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmService } from '../../services/confirm.service';
import { Subject } from '../../models/subject.model';
import { SortOrder } from '../../utils/sort';

type SubjectDraft = {
  subjectName: string;
};

const BLANK: SubjectDraft = {
  subjectName: '',
};

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule, PagerComponent, IconComponent],
  templateUrl: './subjects.component.html',
})
export class SubjectsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  subjects: Subject[] = [];
  loading = true;
  error = '';
  search = '';

  sortKey = '';
  sortDir: SortOrder = 'asc';

  page = 1;
  pageSize = 20;
  total = 0;
  totalPages = 0;

  showForm = false;
  editingId: number | null = null;
  draft: SubjectDraft = { ...BLANK };
  saving = false;
  formError = '';

  private searchTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private subjectSvc: SubjectService,
    private toastSvc: ToastService,
    private confirmSvc: ConfirmService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchTimer);
  }

  trackBySubjectId(_index: number, item: Subject): number {
    return item.subjectId;
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.subjectSvc
      .getAll({
        search: this.search.trim() || undefined,
        sortBy: this.sortKey || undefined,
        sortDir: this.sortDir,
        page: this.page,
        pageSize: this.pageSize,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.totalPages > 0 && result.page > result.totalPages) {
            this.page = result.totalPages;
            this.load();
            return;
          }
          this.subjects = result.items;
          this.total = result.total;
          this.totalPages = result.totalPages;
          this.loading = false;
        },
        error: () => {
          this.error = 'Could not load subjects. Confirm the API is running.';
          this.loading = false;
        },
      });
  }

  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.page = 1;
      this.load();
    }, 300);
  }

  toggleSort(key: string): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
    this.page = 1;
    this.load();
  }

  goToPage(p: number): void {
    if (p === this.page) return;
    this.page = p;
    this.load();
  }

  changePageSize(size: number): void {
    if (size === this.pageSize) return;
    this.pageSize = size;
    this.page = 1;
    this.load();
  }

  openCreate(): void {
    this.editingId = null;
    this.draft = { ...BLANK };
    this.formError = '';
    this.showForm = true;
  }

  openEdit(s: Subject): void {
    this.editingId = s.subjectId;
    this.draft = {
      subjectName: s.subjectName,
    };
    this.formError = '';
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.formError = '';
  }

  save(): void {
    if (!this.draft.subjectName.trim()) {
      this.formError = 'Subject name is required.';
      return;
    }
    this.saving = true;
    this.formError = '';

    const base = {
      subjectName: this.draft.subjectName,
    };

    if (this.editingId === null) {
      const payload: Subject = { subjectId: 0, ...base };
      this.subjectSvc.create(payload).subscribe({
        next: () => this.onSaved('Subject added.'),
        error: (err) => this.onSaveError(err),
      });
    } else {
      const payload: Subject = { subjectId: this.editingId, ...base };
      this.subjectSvc.update(this.editingId, payload).subscribe({
        next: () => this.onSaved('Subject updated.'),
        error: (err) => this.onSaveError(err),
      });
    }
  }

  private onSaved(msg: string): void {
    this.saving = false;
    this.showForm = false;
    this.toastSvc.success(msg);
    this.load();
  }

  private onSaveError(err: HttpErrorResponse): void {
    this.saving = false;
    const body = err.error;
    if (body?.errors) {
      this.formError = Object.values(body.errors).flat().join('. ');
    } else {
      this.formError = body?.message ?? 'Save failed. Please try again.';
    }
  }

  remove(s: Subject): void {
    this.confirmSvc.confirm({
      title: 'Remove subject',
      message: `Remove subject "${s.subjectName}"? It will also be detached from all majors, teachers, and class schedules that use it. This cannot be undone.`,
      confirmLabel: 'Remove',
      danger: true,
    }).subscribe((confirmed) => {
      if (!confirmed) return;
      this.subjectSvc.delete(s.subjectId).subscribe({
        next: () => {
          this.toastSvc.success('Subject removed.');
          this.load();
        },
        error: (err) => {
          const detail = err?.error?.message;
          this.toastSvc.error(detail ?? 'Delete failed. Please try again.');
        },
      });
    });
  }
}
