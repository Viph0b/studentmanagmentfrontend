import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { StudentService } from "../../services/student.service";
import { MajorService } from "../../services/major.service";
import { GroupService } from "../../services/group.service";
import { ToastService } from "../../services/toast.service";
import { ConfirmService } from "../../services/confirm.service";
import { Student } from "../../models/student.model";
import { LabelValue } from "../../models/label-value.model";
import { Group } from "../../models/group.model";
import {
  isEmail,
  isNotFuture,
  isPhone,
  isRealDate,
} from "../../utils/validators";

type StudentDraft = {
  studentName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  majorId: number;
  groupId: number;
};

const BLANK: StudentDraft = {
  studentName: "",
  gender: "Male",
  dateOfBirth: "",
  phoneNumber: "",
  email: "",
  majorId: 0,
  groupId: 0,
};

@Component({
  selector: "app-students",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./students.component.html",
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  loading = true;
  error = "";

  majorOptions: LabelValue[] = [];
  groups: Group[] = [];

  search = "";

  showForm = false;
  editingId: number | null = null;
  draft: StudentDraft = { ...BLANK };
  saving = false;
  formError = "";
  emailError = "";
  phoneError = "";
  dobError = "";

  constructor(
    private studentSvc: StudentService,
    private majorSvc: MajorService,
    private groupSvc: GroupService,
    private toastSvc: ToastService,
    private confirmSvc: ConfirmService,
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadLookups();
  }

  load(): void {
    this.loading = true;
    this.error = "";
    this.studentSvc.getAll().subscribe({
      next: (data) => {
        this.students = data;
        this.loading = false;
      },
      error: () => {
        this.error =
          "Could not load students. Confirm the API is running at http://localhost:5073.";
        this.loading = false;
      },
    });
  }

  loadLookups(): void {
    this.majorSvc.getOptions().subscribe({
      next: (options) => (this.majorOptions = options),
      error: () => (this.majorOptions = []),
    });

    this.groupSvc.getAll().subscribe({
      next: (data) => (this.groups = data),
      error: () => (this.groups = []),
    });
  }

  get visibleGroups(): LabelValue[] {
    const majorId = Number(this.draft.majorId) || 0;
    return this.groups
      .filter((g) => !majorId || g.majorId === majorId)
      .map((g) => ({ id: g.groupId, name: g.groupName }));
  }

  onGroupChange(): void {
    const group = this.groups.find((g) => g.groupId === Number(this.draft.groupId));
    if (group) this.draft.majorId = group.majorId;
  }

  onMajorChange(): void {
    this.draft.groupId = 0;
  }

  get filtered(): Student[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.students;
    return this.students.filter(
      (s) =>
        s.studentName?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.majorName?.toLowerCase().includes(q) ||
        s.groupName?.toLowerCase().includes(q) ||
        String(s.studentId).includes(q),
    );
  }

  openCreate(): void {
    this.editingId = null;
    this.draft = { ...BLANK };
    this.formError = "";
    this.emailError = "";
    this.phoneError = "";
    this.dobError = "";
    this.showForm = true;
  }

  openEdit(s: Student): void {
    this.editingId = s.studentId;
    this.draft = {
      studentName: s.studentName,
      gender: s.gender,
      dateOfBirth: s.dateOfBirth ? s.dateOfBirth.substring(0, 10) : "",
      phoneNumber: s.phoneNumber,
      email: s.email,
      majorId: s.majorId,
      groupId: s.groupId,
    };
    this.formError = "";
    this.emailError = "";
    this.phoneError = "";
    this.dobError = "";
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.formError = "";
    this.emailError = "";
    this.phoneError = "";
    this.dobError = "";
  }

  save(): void {
    if (!this.draft.studentName.trim()) {
      this.formError = "Student name is required.";
      return;
    }

    this.emailError = "";
    this.phoneError = "";
    this.dobError = "";

    const dob = this.draft.dateOfBirth;
    if (!isRealDate(dob)) {
      this.dobError = "Enter a valid date of birth.";
      return;
    }
    if (!isNotFuture(dob)) {
      this.dobError = "Date of birth cannot be in the future.";
      return;
    }
    if (!Number(this.draft.groupId)) {
      this.formError = "Select a group.";
      return;
    }

    const email = this.draft.email.trim();
    const phone = this.draft.phoneNumber.trim();
    if (email && !isEmail(email)) {
      this.emailError = "Enter a valid email (e.g. name@example.com).";
      return;
    }
    if (phone && !isPhone(phone)) {
      this.phoneError = "Enter a valid phone number (8–15 digits).";
      return;
    }
    this.saving = true;
    this.formError = "";

    if (this.editingId === null) {
      const payload: Student = {
        studentId: 0, // server assigns the real id
        studentName: this.draft.studentName,
        gender: this.draft.gender,
        dateOfBirth: this.draft.dateOfBirth,
        phoneNumber: this.draft.phoneNumber,
        email: this.draft.email,
        majorId: Number(this.draft.majorId) || 0,
        groupId: Number(this.draft.groupId) || 0,
      };
      this.studentSvc.create(payload).subscribe({
        next: () => this.onSaved("Student added."),
        error: () => this.onSaveError(),
      });
    } else {
      const existing = this.students.find(
        (s) => s.studentId === this.editingId,
      );
      const payload: Student = {
        id: existing?.id,
        studentId: this.editingId,
        studentName: this.draft.studentName,
        gender: this.draft.gender,
        dateOfBirth: this.draft.dateOfBirth,
        phoneNumber: this.draft.phoneNumber,
        email: this.draft.email,
        majorId: Number(this.draft.majorId) || 0,
        groupId: Number(this.draft.groupId) || 0,
      };
      this.studentSvc.update(this.editingId, payload).subscribe({
        next: () => this.onSaved("Student updated."),
        error: () => this.onSaveError(),
      });
    }
  }

  private onSaved(msg: string): void {
    this.saving = false;
    this.showForm = false;
    this.toastSvc.success(msg);
    this.load();
    this.loadLookups();
  }

  private onSaveError(): void {
    this.saving = false;
    this.formError = "Save failed. Check the API connection and try again.";
  }

  remove(s: Student): void {
    this.confirmSvc
      .confirm({
        title: "Remove student",
        message: `Remove ${s.studentName} (ID ${s.studentId})? This cannot be undone.`,
        confirmLabel: "Remove",
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.studentSvc.delete(s.studentId).subscribe({
          next: () => {
            this.toastSvc.success("Student removed.");
            this.load();
          },
          error: () => {
            this.toastSvc.error("Delete failed. Please try again.");
          },
        });
      });
  }
}
