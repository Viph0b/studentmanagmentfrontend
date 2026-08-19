import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PagerComponent } from '../../components/pager/pager.component';
import { GroupService } from '../../services/group.service';
import { MajorService } from '../../services/major.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmService } from '../../services/confirm.service';
import { Group } from '../../models/group.model';
import { LabelValue } from '../../models/label-value.model';
import { isAcademicYear } from '../../utils/validators';
import { SortOrder } from '../../utils/sort';

type GroupDraft = {
  groupName: string;
  majorId: number;
  currentSemester: number;
  academicYear: string;
  shift: string;
  status: string;
};

const BLANK: GroupDraft = {
  groupName: '',
  majorId: 0,
  currentSemester: 1,
  academicYear: '2025-2026',
  shift: 'Morning',
  status: 'Active',
};

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, PagerComponent],
  templateUrl: './groups.component.html',
})
export class GroupsComponent implements OnInit {
  groups: Group[] = [];
  loading = true;
  error = '';
  search = '';

  sortKey = '';
  sortDir: SortOrder = 'asc';

  page = 1;
  pageSize = 20;
  total = 0;
  totalPages = 0;

  majorOptions: LabelValue[] = [];
  semesterOptions = [1, 2, 3, 4, 5, 6, 7, 8];

  showForm = false;
  editingId: number | null = null;
  draft: GroupDraft = { ...BLANK };
  saving = false;
  formError = '';
  majorError = '';
  yearError = '';

  private searchTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private groupSvc: GroupService,
    private majorSvc: MajorService,
    private toastSvc: ToastService,
    private confirmSvc: ConfirmService
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadLookups();
  }

  loadLookups(): void {
    this.majorSvc.getOptions().subscribe({
      next: (options) => (this.majorOptions = options),
      error: () => (this.majorOptions = []),
    });
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.groupSvc
      .getAll({
        search: this.search.trim() || undefined,
        sortBy: this.sortKey || undefined,
        sortDir: this.sortDir,
        page: this.page,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (result) => {
          if (result.totalPages > 0 && result.page > result.totalPages) {
            this.page = result.totalPages;
            this.load();
            return;
          }
          this.groups = result.items;
          this.total = result.total;
          this.totalPages = result.totalPages;
          this.loading = false;
        },
        error: () => {
          this.error = 'Could not load groups. Confirm the API is running.';
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
    this.majorError = '';
    this.yearError = '';
    this.showForm = true;
  }

  openEdit(g: Group): void {
    this.editingId = g.groupId;
    this.draft = {
      groupName: g.groupName,
      majorId: g.majorId,
      currentSemester: g.currentSemester,
      academicYear: g.academicYear,
      shift: g.shift,
      status: g.status,
    };
    this.formError = '';
    this.majorError = '';
    this.yearError = '';
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.formError = '';
    this.majorError = '';
    this.yearError = '';
  }

  save(): void {
    if (!this.draft.groupName.trim()) {
      this.formError = 'Group name is required.';
      return;
    }
    this.majorError = '';
    this.yearError = '';
    if (!Number(this.draft.majorId)) {
      this.majorError = 'Select a major.';
      return;
    }
    if (!isAcademicYear(this.draft.academicYear)) {
      this.yearError = 'Enter an academic year like 2025-2026.';
      return;
    }
    this.saving = true;
    this.formError = '';

    const base = {
      groupName: this.draft.groupName,
      majorId: Number(this.draft.majorId) || 0,
      currentSemester: Number(this.draft.currentSemester) || 1,
      academicYear: this.draft.academicYear,
      shift: this.draft.shift,
      status: this.draft.status,
    };

    if (this.editingId === null) {
      const payload: Group = { groupId: 0, ...base };
      this.groupSvc.create(payload).subscribe({
        next: () => this.onSaved('Group added.'),
        error: () => this.onSaveError(),
      });
    } else {
      const payload: Group = { groupId: this.editingId, ...base };
      this.groupSvc.update(this.editingId, payload).subscribe({
        next: () => this.onSaved('Group updated.'),
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
    this.formError = 'Save failed. Check the API connection and try again.';
  }

  remove(g: Group): void {
    this.confirmSvc.confirm({
      title: 'Remove group',
      message: `Remove group "${g.groupName}"? This cannot be undone.`,
      confirmLabel: 'Remove',
      danger: true,
    }).subscribe((confirmed) => {
      if (!confirmed) return;
      this.groupSvc.delete(g.groupId).subscribe({
        next: () => {
          this.toastSvc.success('Group removed.');
          this.load();
        },
        error: () => {
          this.toastSvc.error('Delete failed. Please try again.');
        },
      });
    });
  }
}
