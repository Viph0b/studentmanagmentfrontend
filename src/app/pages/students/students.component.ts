import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { StudentService } from '../../services/student.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmService } from '../../services/confirm.service';
import { Student } from '../../models/student.model';

type StudentDraft = {
  studentName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  major: string;
  groupName: string;
};

const BLANK: StudentDraft = {
  studentName: '',
  gender: 'Male',
  dateOfBirth: '',
  phoneNumber: '',
  email: '',
  major: '',
  groupName: '',
};

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.component.html',
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  loading = true;
  error = '';

  search = '';

  showForm = false;
  editingId: number | null = null;
  draft: StudentDraft = { ...BLANK };
  saving = false;
  formError = '';

  constructor(
    private studentSvc: StudentService,
    private toastSvc: ToastService,
    private confirmSvc: ConfirmService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.studentSvc.getAll().subscribe({
      next: (data) => {
        this.students = data;
        this.loading = false;
      },
      error: () => {
        this.error =
          'Could not load students. Confirm the API is running at http://localhost:5073.';
        this.loading = false;
      },
    });
  }

  get filtered(): Student[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.students;
    return this.students.filter(
      (s) =>
        s.studentName?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.major?.toLowerCase().includes(q) ||
        s.groupName?.toLowerCase().includes(q) ||
        String(s.studentId).includes(q)
    );
  }

  openCreate(): void {
    this.editingId = null;
    this.draft = { ...BLANK };
    this.formError = '';
    this.showForm = true;
  }

  openEdit(s: Student): void {
    this.editingId = s.studentId;
    this.draft = {
      studentName: s.studentName,
      gender: s.gender,
      dateOfBirth: s.dateOfBirth ? s.dateOfBirth.substring(0, 10) : '',
      phoneNumber: s.phoneNumber,
      email: s.email,
      major: s.major,
      groupName: s.groupName,
    };
    this.formError = '';
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.formError = '';
  }

  save(): void {
    if (!this.draft.studentName.trim()) {
      this.formError = 'Student name is required.';
      return;
    }
    this.saving = true;
    this.formError = '';

    if (this.editingId === null) {
      const payload: Student = {
        studentId: 0, // server assigns the real id
        studentName: this.draft.studentName,
        gender: this.draft.gender,
        dateOfBirth: this.draft.dateOfBirth,
        phoneNumber: this.draft.phoneNumber,
        email: this.draft.email,
        major: this.draft.major,
        groupName: this.draft.groupName,
        attendances: [],
        exams: [],
      };
      this.studentSvc.create(payload).subscribe({
        next: () => this.onSaved('Student added.'),
        error: () => this.onSaveError(),
      });
    } else {
      const existing = this.students.find(
        (s) => s.studentId === this.editingId
      );
      const payload: Student = {
        id: existing?.id,
        studentId: this.editingId,
        studentName: this.draft.studentName,
        gender: this.draft.gender,
        dateOfBirth: this.draft.dateOfBirth,
        phoneNumber: this.draft.phoneNumber,
        email: this.draft.email,
        major: this.draft.major,
        groupName: this.draft.groupName,
        attendances: existing?.attendances ?? [],
        exams: existing?.exams ?? [],
      };
      this.studentSvc.update(this.editingId, payload).subscribe({
        next: () => this.onSaved('Student updated.'),
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

  remove(s: Student): void {
    this.confirmSvc.confirm({
      title: 'Remove student',
      message: `Remove ${s.studentName} (ID ${s.studentId})? This cannot be undone.`,
      confirmLabel: 'Remove',
      danger: true,
    }).subscribe((confirmed) => {
      if (!confirmed) return;
      this.studentSvc.delete(s.studentId).subscribe({
        next: () => {
          this.toastSvc.success('Student removed.');
          this.load();
        },
        error: () => {
          this.toastSvc.error('Delete failed. Please try again.');
        },
      });
    });
  }
}
