import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FeePaymentService } from '../../services/fee-payment.service';
import { StudentService } from '../../services/student.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmService } from '../../services/confirm.service';
import { StudentFeePayment } from '../../models/fee-payment.model';
import { Student } from '../../models/student.model';

type PaymentDraft = {
  studentId: number;
  semester: number;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
};

const BLANK: PaymentDraft = {
  studentId: 0,
  semester: 1,
  amountPaid: 0,
  paymentDate: new Date().toISOString().substring(0, 10),
  paymentMethod: 'Cash',
  status: 'Paid',
};

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.component.html',
})
export class PaymentsComponent implements OnInit {
  payments: StudentFeePayment[] = [];
  students: Student[] = [];
  loading = true;
  error = '';
  search = '';

  showForm = false;
  editingId: number | null = null;
  draft: PaymentDraft = { ...BLANK };
  saving = false;
  formError = '';

  constructor(
    private paymentSvc: FeePaymentService,
    private studentSvc: StudentService,
    private toastSvc: ToastService,
    private confirmSvc: ConfirmService
  ) {}

  ngOnInit(): void {
    this.load();
    this.studentSvc.getAll().subscribe({
      next: (students) => (this.students = students),
      error: () => (this.students = []),
    });
  }

  studentName(id: number): string {
    return this.students.find((s) => s.studentId === id)?.studentName ?? String(id);
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.paymentSvc.getAll().subscribe({
      next: (data) => {
        this.payments = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load payments. Confirm the API is running.';
        this.loading = false;
      },
    });
  }

  get filtered(): StudentFeePayment[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.payments;
    return this.payments.filter(
      (p) =>
        this.studentName(p.studentId).toLowerCase().includes(q) ||
        String(p.studentId).includes(q) ||
        p.paymentMethod?.toLowerCase().includes(q) ||
        p.status?.toLowerCase().includes(q)
    );
  }

  isPaid(status: string): boolean {
    return status?.trim().toLowerCase() === 'paid';
  }

  openCreate(): void {
    this.editingId = null;
    this.draft = { ...BLANK, paymentDate: new Date().toISOString().substring(0, 10) };
    this.formError = '';
    this.showForm = true;
  }

  openEdit(p: StudentFeePayment): void {
    this.editingId = p.paymentId;
    this.draft = {
      studentId: p.studentId,
      semester: p.semester,
      amountPaid: p.amountPaid,
      paymentDate: p.paymentDate ? p.paymentDate.substring(0, 10) : '',
      paymentMethod: p.paymentMethod,
      status: p.status,
    };
    this.formError = '';
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.formError = '';
  }

  save(): void {
    if (!this.draft.studentId) {
      this.formError = 'Please select a student.';
      return;
    }
    this.saving = true;
    this.formError = '';

    const base = {
      studentId: Number(this.draft.studentId),
      semester: Number(this.draft.semester) || 1,
      amountPaid: Number(this.draft.amountPaid) || 0,
      paymentDate: this.draft.paymentDate
        ? new Date(this.draft.paymentDate).toISOString()
        : new Date().toISOString(),
      paymentMethod: this.draft.paymentMethod,
      status: this.draft.status,
    };

    if (this.editingId === null) {
      const payload: StudentFeePayment = { paymentId: 0, ...base };
      this.paymentSvc.create(payload).subscribe({
        next: () => this.onSaved('Payment recorded.'),
        error: () => this.onSaveError(),
      });
    } else {
      const payload: StudentFeePayment = { paymentId: this.editingId, ...base };
      this.paymentSvc.update(this.editingId, payload).subscribe({
        next: () => this.onSaved('Payment updated.'),
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

  remove(p: StudentFeePayment): void {
    this.confirmSvc.confirm({
      title: 'Remove payment',
      message: `Remove payment #${p.paymentId} for student ${this.studentName(p.studentId)}? This cannot be undone.`,
      confirmLabel: 'Remove',
      danger: true,
    }).subscribe((confirmed) => {
      if (!confirmed) return;
      this.paymentSvc.delete(p.paymentId).subscribe({
        next: () => {
          this.toastSvc.success('Payment removed.');
          this.load();
        },
        error: () => {
          this.toastSvc.error('Delete failed. Please try again.');
        },
      });
    });
  }
}
