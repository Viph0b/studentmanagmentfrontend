import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { PagerComponent } from "../../components/pager/pager.component";
import { IconComponent } from "../../components/icon/icon.component";
import { FeePaymentService } from "../../services/fee-payment.service";
import { StudentService } from "../../services/student.service";
import { MajorService } from "../../services/major.service";
import { ToastService } from "../../services/toast.service";
import { ConfirmService } from "../../services/confirm.service";
import { StudentFeePayment } from "../../models/fee-payment.model";
import { Student } from "../../models/student.model";
import { Major } from "../../models/major.model";
import { isMoneyMin, isRealDate } from "../../utils/validators";
import { SortOrder } from "../../utils/sort";

type PaymentDraft = {
  studentId: number;
  semester: number;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: string;
};

const BLANK: PaymentDraft = {
  studentId: 0,
  semester: 1,
  amountPaid: 0,
  paymentDate: new Date().toISOString().substring(0, 10),
  paymentMethod: "Cash",
};

@Component({
  selector: "app-payments",
  standalone: true,
  imports: [CommonModule, FormsModule, PagerComponent, IconComponent],
  templateUrl: "./payments.component.html",
})
export class PaymentsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  payments: StudentFeePayment[] = [];
  students: Student[] = [];
  majors: Major[] = [];
  semesterOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  loading = true;
  error = "";
  search = "";

  sortKey = "";
  sortDir: SortOrder = "asc";

  page = 1;
  pageSize = 20;
  total = 0;
  totalPages = 0;

  showForm = false;
  editingId: number | null = null;
  draft: PaymentDraft = { ...BLANK };
  saving = false;
  formError = "";
  amountError = "";
  dateError = "";

  private searchTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private paymentSvc: FeePaymentService,
    private studentSvc: StudentService,
    private majorSvc: MajorService,
    private toastSvc: ToastService,
    private confirmSvc: ConfirmService,
  ) {}

  ngOnInit(): void {
    this.load();
    this.studentSvc.getAll({ pageSize: 200 }).subscribe({
      next: (students) => (this.students = students.items),
      error: () => (this.students = []),
    });
    this.majorSvc.getAll({ pageSize: 200 }).subscribe({
      next: (majors) => (this.majors = majors.items),
      error: () => (this.majors = []),
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchTimer);
  }

  trackByStudentId(_index: number, item: Student): number {
    return item.studentId;
  }

  trackByPaymentId(_index: number, item: StudentFeePayment): number {
    return item.paymentId;
  }

  trackByString(index: number): number {
    return index;
  }

  studentName(id: number): string {
    return (
      this.students.find((s) => s.studentId === id)?.studentName ?? String(id)
    );
  }

  studentMajorName(id: number): string {
    return (
      this.students.find((s) => s.studentId === id)?.majorName ?? "—"
    );
  }

  get selectedStudent(): Student | undefined {
    return this.students.find((s) => s.studentId === Number(this.draft.studentId));
  }

  get selectedMajor(): Major | undefined {
    return this.majors.find((m) => m.majorId === this.selectedStudent?.majorId);
  }

  onStudentChange(): void {
    const price = this.selectedMajor?.pricePerSemester;
    if (price != null) this.draft.amountPaid = price;
  }

  load(): void {
    this.loading = true;
    this.error = "";
    this.paymentSvc
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
          this.payments = result.items;
          this.total = result.total;
          this.totalPages = result.totalPages;
          this.loading = false;
        },
        error: () => {
          this.error = "Could not load payments. Confirm the API is running.";
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
    this.draft = {
      ...BLANK,
      paymentDate: new Date().toISOString().substring(0, 10),
    };
    this.formError = "";
    this.amountError = "";
    this.dateError = "";
    this.showForm = true;
  }

  openEdit(p: StudentFeePayment): void {
    this.editingId = p.paymentId;
    this.draft = {
      studentId: p.studentId,
      semester: p.semester,
      amountPaid: p.amountPaid,
      paymentDate: p.paymentDate ? p.paymentDate.substring(0, 10) : "",
      paymentMethod: p.paymentMethod,
    };
    this.formError = "";
    this.amountError = "";
    this.dateError = "";
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.formError = "";
    this.amountError = "";
    this.dateError = "";
  }

  save(): void {
    if (!this.draft.studentId) {
      this.formError = "Please select a student.";
      return;
    }
    this.amountError = "";
    this.dateError = "";
    const amount = Number(this.draft.amountPaid);
    if (!isMoneyMin(amount, 1)) {
      this.amountError = "Amount paid must be greater than 0.";
      return;
    }
    if (!isRealDate(this.draft.paymentDate)) {
      this.dateError = "Enter a valid payment date.";
      return;
    }
    this.saving = true;
    this.formError = "";

    const base = {
      studentId: Number(this.draft.studentId),
      semester: Number(this.draft.semester) || 1,
      amountPaid: Number(this.draft.amountPaid) || 0,
      paymentDate: this.draft.paymentDate
        ? new Date(this.draft.paymentDate).toISOString()
        : new Date().toISOString(),
      paymentMethod: this.draft.paymentMethod,
    };

    if (this.editingId === null) {
      const payload: StudentFeePayment = { paymentId: 0, ...base };
      this.paymentSvc.create(payload).subscribe({
        next: () => this.onSaved("Payment recorded."),
        error: () => this.onSaveError(),
      });
    } else {
      const payload: StudentFeePayment = { paymentId: this.editingId, ...base };
      this.paymentSvc.update(this.editingId, payload).subscribe({
        next: () => this.onSaved("Payment updated."),
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
    this.formError = "Save failed. Check the API connection and try again.";
  }

  remove(p: StudentFeePayment): void {
    this.confirmSvc
      .confirm({
        title: "Remove payment",
        message: `Remove payment #${p.paymentId} for student ${this.studentName(p.studentId)}? This cannot be undone.`,
        confirmLabel: "Remove",
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.paymentSvc.delete(p.paymentId).subscribe({
          next: () => {
            this.toastSvc.success("Payment removed.");
            this.load();
          },
          error: () => {
            this.toastSvc.error("Delete failed. Please try again.");
          },
        });
      });
  }
}
