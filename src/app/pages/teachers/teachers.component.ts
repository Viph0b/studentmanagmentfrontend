import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { TeacherService } from "../../services/teacher.service";
import { SubjectService } from "../../services/subject.service";
import { ToastService } from "../../services/toast.service";
import { ConfirmService } from "../../services/confirm.service";
import { Teacher } from "../../models/teacher.model";

type TeacherDraft = {
  teacherName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  subjects: string[];
  salary: number;
};

const BLANK: TeacherDraft = {
  teacherName: "",
  gender: "Male",
  dateOfBirth: "",
  phoneNumber: "",
  subjects: [],
  salary: 0,
};

@Component({
  selector: "app-teachers",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./teachers.component.html",
})
export class TeachersComponent implements OnInit {
  teachers: Teacher[] = [];
  loading = true;
  error = "";
  search = "";

  subjectOptions: string[] = [];
  showAllSubjects = false;
  readonly subjectsPreviewLimit = 25;

  get visibleSubjects(): string[] {
    return this.showAllSubjects
      ? this.subjectOptions
      : this.subjectOptions.slice(0, this.subjectsPreviewLimit);
  }

  showForm = false;
  editingId: number | null = null;
  draft: TeacherDraft = { ...BLANK };
  saving = false;
  formError = "";
  phoneError = "";
  subjectError = "";

  constructor(
    private teacherSvc: TeacherService,
    private subjectSvc: SubjectService,
    private toastSvc: ToastService,
    private confirmSvc: ConfirmService,
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.subjectSvc.getNames().subscribe({
      next: (subjects) => (this.subjectOptions = subjects),
      error: () => (this.subjectOptions = []),
    });
  }

  isSubjectChecked(subject: string): boolean {
    return this.draft.subjects.includes(subject);
  }

  toggleSubject(subject: string): void {
    const idx = this.draft.subjects.indexOf(subject);
    if (idx === -1) {
      this.draft.subjects.push(subject);
    } else {
      this.draft.subjects.splice(idx, 1);
    }
    this.subjectError = "";
  }

  toggleShowSubjects(): void {
    this.showAllSubjects = !this.showAllSubjects;
  }

  load(): void {
    this.loading = true;
    this.error = "";
    this.teacherSvc.getAll().subscribe({
      next: (data) => {
        this.teachers = data;
        this.loading = false;
      },
      error: () => {
        this.error = "Could not load teachers. Confirm the API is running.";
        this.loading = false;
      },
    });
  }

  get filtered(): Teacher[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.teachers;
    return this.teachers.filter(
      (t) =>
        t.teacherName?.toLowerCase().includes(q) ||
        t.subjects?.join(", ").toLowerCase().includes(q) ||
        String(t.teacherId).includes(q),
    );
  }

  openCreate(): void {
    this.editingId = null;
    this.draft = { ...BLANK };
    this.formError = "";
    this.phoneError = "";
    this.subjectError = "";
    this.showAllSubjects = false;
    this.showForm = true;
  }

  openEdit(t: Teacher): void {
    this.editingId = t.teacherId;
    this.draft = {
      teacherName: t.teacherName,
      gender: t.gender,
      dateOfBirth: t.dateOfBirth ? t.dateOfBirth.substring(0, 10) : "",
      phoneNumber: t.phoneNumber,
      subjects: t.subjects ?? [],
      salary: t.salary,
    };
    this.formError = "";
    this.phoneError = "";
    this.subjectError = "";
    this.showAllSubjects = false;
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.formError = "";
    this.phoneError = "";
    this.subjectError = "";
  }

  save(): void {
    if (!this.draft.teacherName.trim()) {
      this.formError = "Teacher name is required.";
      return;
    }
    this.phoneError = "";
    this.subjectError = "";
    if (this.draft.subjects.length === 0) {
      this.subjectError = "Select at least one subject.";
      return;
    }
    const phone = this.draft.phoneNumber.trim();
    if (phone) {
      const digits = phone.replace(/[\s().-]/g, "");
      if (!/^\+?\d{8,15}$/.test(digits)) {
        this.phoneError = "Enter a valid phone number (8–15 digits).";
        return;
      }
    }
    this.saving = true;
    this.formError = "";

    const base = {
      teacherName: this.draft.teacherName,
      gender: this.draft.gender,
      dateOfBirth: this.draft.dateOfBirth,
      phoneNumber: this.draft.phoneNumber,
      subjects: this.draft.subjects,
      salary: Number(this.draft.salary) || 0,
    };

    if (this.editingId === null) {
      const payload: Teacher = { teacherId: 0, ...base };
      this.teacherSvc.create(payload).subscribe({
        next: () => this.onSaved("Teacher added."),
        error: () => this.onSaveError(),
      });
    } else {
      const payload: Teacher = { teacherId: this.editingId, ...base };
      this.teacherSvc.update(this.editingId, payload).subscribe({
        next: () => this.onSaved("Teacher updated."),
        error: () => this.onSaveError(),
      });
    }
  }

  private onSaved(msg: string): void {
    this.saving = false;
    this.showForm = false;
    this.toastSvc.success(msg);
    this.load();
    this.loadSubjects();
  }

  private onSaveError(): void {
    this.saving = false;
    this.formError = "Save failed. Check the API connection and try again.";
  }

  remove(t: Teacher): void {
    this.confirmSvc
      .confirm({
        title: "Remove teacher",
        message: `Remove ${t.teacherName} (ID ${t.teacherId})? This cannot be undone.`,
        confirmLabel: "Remove",
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.teacherSvc.delete(t.teacherId).subscribe({
          next: () => {
            this.toastSvc.success("Teacher removed.");
            this.load();
          },
          error: () => {
            this.toastSvc.error("Delete failed. Please try again.");
          },
        });
      });
  }
}
