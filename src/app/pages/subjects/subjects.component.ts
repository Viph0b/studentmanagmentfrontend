import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SubjectService } from '../../services/subject.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmService } from '../../services/confirm.service';
import { Subject } from '../../models/subject.model';

type SubjectDraft = {
  subjectName: string;
};

const BLANK: SubjectDraft = {
  subjectName: '',
};

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subjects.component.html',
})
export class SubjectsComponent implements OnInit {
  subjects: Subject[] = [];
  loading = true;
  error = '';
  search = '';

  showForm = false;
  editingId: number | null = null;
  draft: SubjectDraft = { ...BLANK };
  saving = false;
  formError = '';

  constructor(
    private subjectSvc: SubjectService,
    private toastSvc: ToastService,
    private confirmSvc: ConfirmService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.subjectSvc.getAll().subscribe({
      next: (data) => {
        this.subjects = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load subjects. Confirm the API is running.';
        this.loading = false;
      },
    });
  }

  get filtered(): Subject[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.subjects;
    return this.subjects.filter(
      (s) =>
        s.subjectName?.toLowerCase().includes(q) || String(s.subjectId).includes(q)
    );
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
        error: () => this.onSaveError(),
      });
    } else {
      const payload: Subject = { subjectId: this.editingId, ...base };
      this.subjectSvc.update(this.editingId, payload).subscribe({
        next: () => this.onSaved('Subject updated.'),
        error: () => this.onSaveError(),
      });
    }
  }

  private onSaved(msg: string): void {
    this.saving = false;
    this.showForm = false;
    this.toastSvc.success(msg);
    this.load();
  }

  private onSaveError(): void {
    this.saving = false;
    this.formError = 'Save failed. Check the API connection and try again.';
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
