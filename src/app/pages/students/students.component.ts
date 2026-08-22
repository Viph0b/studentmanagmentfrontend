import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { PagerComponent } from "../../components/pager/pager.component";
import { IconComponent } from "../../components/icon/icon.component";
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
  isFilled,
  isNotFuture,
  isPhone,
  isRealDate,
} from "../../utils/validators";
import { SortOrder } from "../../utils/sort";

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
  imports: [CommonModule, FormsModule, PagerComponent, IconComponent],
  templateUrl: "./students.component.html",
})
export class StudentsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  students: Student[] = [];
  loading = true;
  error = "";

  majorOptions: LabelValue[] = [];
  groups: Group[] = [];

  search = "";

  sortKey = "";
  sortDir: SortOrder = "asc";

  page = 1;
  pageSize = 20;
  total = 0;
  totalPages = 0;

  showForm = false;
  editingId: number | null = null;
  draft: StudentDraft = { ...BLANK };
  saving = false;
  formError = "";
  emailError = "";
  phoneError = "";
  dobError = "";

  private searchTimer?: ReturnType<typeof setTimeout>;

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

  ngOnDestroy(): void {
    clearTimeout(this.searchTimer);
  }

  trackById(_index: number, item: { id: number }): number {
    return item.id;
  }

  trackByStudentId(_index: number, item: Student): number {
    return item.studentId;
  }

  load(): void {
    this.loading = true;
    this.error = "";
    this.studentSvc
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
          this.students = result.items;
          this.total = result.total;
          this.totalPages = result.totalPages;
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

    this.groupSvc.getAll({ pageSize: 200 }).subscribe({
      next: (result) => (this.groups = result.items),
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

  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.page = 1;
      this.load();
    }, 300);
  }

  toggleSort(key: string): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === "asc" ? "desc" : "asc";
    } else {
      this.sortKey = key;
      this.sortDir = "asc";
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
    if (!isFilled(phone)) {
      this.phoneError = "Phone number is required.";
      return;
    }
    if (!isFilled(email)) {
      this.emailError = "Email is required.";
      return;
    }
    if (!isEmail(email)) {
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
        error: (err) => this.onSaveError(err),
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
        error: (err) => this.onSaveError(err),
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

  private onSaveError(err: HttpErrorResponse): void {
    this.saving = false;
    const body = err.error;
    if (body?.errors) {
      this.formError = Object.values(body.errors).flat().join('. ');
    } else {
      this.formError = body?.message ?? 'Save failed. Please try again.';
    }
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