import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { PagerComponent } from "../../components/pager/pager.component";
import { IconComponent } from "../../components/icon/icon.component";
import { MajorService } from "../../services/major.service";
import { SubjectService } from "../../services/subject.service";
import { ToastService } from "../../services/toast.service";
import { ConfirmService } from "../../services/confirm.service";
import { Major } from "../../models/major.model";
import { LabelValue } from "../../models/label-value.model";
import { isMoneyMin } from "../../utils/validators";
import { SortOrder } from "../../utils/sort";

type MajorDraft = {
  majorName: string;
  pricePerSemester: number;
  subjectIds: number[];
};

const BLANK: MajorDraft = {
  majorName: "",
  pricePerSemester: 0,
  subjectIds: [],
};

@Component({
  selector: "app-majors",
  standalone: true,
  imports: [CommonModule, FormsModule, PagerComponent, IconComponent],
  templateUrl: "./majors.component.html",
})
export class MajorsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  majors: Major[] = [];
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
  draft: MajorDraft = { ...BLANK };
  saving = false;
  formError = "";
  priceError = "";

  subjectOptions: LabelValue[] = [];
  showAllSubjects = false;
  readonly previewLimit = 25;

  private searchTimer?: ReturnType<typeof setTimeout>;

  get visibleSubjects(): LabelValue[] {
    return this.showAllSubjects
      ? this.subjectOptions
      : this.subjectOptions.slice(0, this.previewLimit);
  }

  constructor(
    private majorSvc: MajorService,
    private subjectSvc: SubjectService,
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

  trackByMajorId(_index: number, item: Major): number {
    return item.majorId;
  }

  trackByString(index: number): number {
    return index;
  }

  loadLookups(): void {
    this.subjectSvc.getOptions().subscribe({
      next: (subjects) => (this.subjectOptions = subjects),
      error: () => (this.subjectOptions = []),
    });
  }

  isSubjectChecked(subject: LabelValue): boolean {
    return this.draft.subjectIds.includes(subject.id);
  }

  toggleSubject(subject: LabelValue): void {
    const idx = this.draft.subjectIds.indexOf(subject.id);
    if (idx === -1) this.draft.subjectIds.push(subject.id);
    else this.draft.subjectIds.splice(idx, 1);
  }

  toggleShowSubjects(): void {
    this.showAllSubjects = !this.showAllSubjects;
  }

  load(): void {
    this.loading = true;
    this.error = "";
    this.majorSvc
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
          this.majors = result.items;
          this.total = result.total;
          this.totalPages = result.totalPages;
          this.loading = false;
        },
        error: () => {
          this.error = "Could not load majors. Confirm the API is running.";
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
    this.draft = { ...BLANK };
    this.formError = "";
    this.priceError = "";
    this.showAllSubjects = false;
    this.showForm = true;
  }

  openEdit(m: Major): void {
    this.editingId = m.majorId;
    this.draft = {
      majorName: m.majorName,
      pricePerSemester: m.pricePerSemester,
      subjectIds: m.subjectIds ?? [],
    };
    this.formError = "";
    this.priceError = "";
    this.showAllSubjects = false;
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.formError = "";
    this.priceError = "";
  }

  save(): void {
    if (!this.draft.majorName.trim()) {
      this.formError = "Major name is required.";
      return;
    }
    const price = Number(this.draft.pricePerSemester);
    if (!isMoneyMin(price, 1)) {
      this.priceError = "Price per semester must be greater than 0.";
      return;
    }
    this.saving = true;
    this.formError = "";

    const base = {
      majorName: this.draft.majorName,
      pricePerSemester: Number(this.draft.pricePerSemester) || 0,
      subjectIds: this.draft.subjectIds,
    };

    if (this.editingId === null) {
      const payload: Major = { majorId: 0, ...base };
      this.majorSvc.create(payload).subscribe({
        next: () => this.onSaved("Major added."),
        error: (err) => this.onSaveError(err),
      });
    } else {
      const payload: Major = { majorId: this.editingId, ...base };
      this.majorSvc.update(this.editingId, payload).subscribe({
        next: () => this.onSaved("Major updated."),
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

  remove(m: Major): void {
    this.confirmSvc
      .confirm({
        title: "Remove major",
        message: `Remove major "${m.majorName}"? This cannot be undone.`,
        confirmLabel: "Remove",
        danger: true,
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.majorSvc.delete(m.majorId).subscribe({
          next: () => {
            this.toastSvc.success("Major removed.");
            this.load();
          },
          error: () => {
            this.toastSvc.error("Delete failed. Please try again.");
          },
        });
      });
  }
}
