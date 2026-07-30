import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MajorService } from '../../services/major.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmService } from '../../services/confirm.service';
import { Major } from '../../models/major.model';

type MajorDraft = {
  majorName: string;
  pricePerSemester: number;
  subjectsText: string;
  groupText: string;
};

const BLANK: MajorDraft = {
  majorName: '',
  pricePerSemester: 0,
  subjectsText: '',
  groupText: '',
};

@Component({
  selector: 'app-majors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './majors.component.html',
})
export class MajorsComponent implements OnInit {
  majors: Major[] = [];
  loading = true;
  error = '';
  search = '';

  showForm = false;
  editingId: number | null = null;
  draft: MajorDraft = { ...BLANK };
  saving = false;
  formError = '';

  constructor(
    private majorSvc: MajorService,
    private toastSvc: ToastService,
    private confirmSvc: ConfirmService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.majorSvc.getAll().subscribe({
      next: (data) => {
        this.majors = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load majors. Confirm the API is running.';
        this.loading = false;
      },
    });
  }

  get filtered(): Major[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.majors;
    return this.majors.filter(
      (m) =>
        m.majorName?.toLowerCase().includes(q) ||
        String(m.majorId).includes(q)
    );
  }

  openCreate(): void {
    this.editingId = null;
    this.draft = { ...BLANK };
    this.formError = '';
    this.showForm = true;
  }

  openEdit(m: Major): void {
    this.editingId = m.majorId;
    this.draft = {
      majorName: m.majorName,
      pricePerSemester: m.pricePerSemester,
      subjectsText: (m.subjects ?? []).join(', '),
      groupText: (m.group ?? []).join(', '),
    };
    this.formError = '';
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.formError = '';
  }

  private toArray(text: string): string[] {
    return text
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  save(): void {
    if (!this.draft.majorName.trim()) {
      this.formError = 'Major name is required.';
      return;
    }
    this.saving = true;
    this.formError = '';

    const base = {
      majorName: this.draft.majorName,
      pricePerSemester: Number(this.draft.pricePerSemester) || 0,
      subjects: this.toArray(this.draft.subjectsText),
      group: this.toArray(this.draft.groupText),
    };

    if (this.editingId === null) {
      const payload: Major = { majorId: 0, ...base };
      this.majorSvc.create(payload).subscribe({
        next: () => this.onSaved('Major added.'),
        error: () => this.onSaveError(),
      });
    } else {
      const payload: Major = { majorId: this.editingId, ...base };
      this.majorSvc.update(this.editingId, payload).subscribe({
        next: () => this.onSaved('Major updated.'),
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

  remove(m: Major): void {
    this.confirmSvc.confirm({
      title: 'Remove major',
      message: `Remove major "${m.majorName}"? This cannot be undone.`,
      confirmLabel: 'Remove',
      danger: true,
    }).subscribe((confirmed) => {
      if (!confirmed) return;
      this.majorSvc.delete(m.majorId).subscribe({
        next: () => {
          this.toastSvc.success('Major removed.');
          this.load();
        },
        error: () => {
          this.toastSvc.error('Delete failed. Please try again.');
        },
      });
    });
  }
}
