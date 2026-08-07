import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { MajorService } from "../../services/major.service";
import { GroupService } from "../../services/group.service";
import { ToastService } from "../../services/toast.service";
import { ConfirmService } from "../../services/confirm.service";
import { Major } from "../../models/major.model";

type MajorDraft = {
  majorName: string;
  pricePerSemester: number;
  subjects: string[];
  groups: string[];
};

const BLANK: MajorDraft = {
  majorName: "",
  pricePerSemester: 0,
  subjects: [],
  groups: [],
};

@Component({
  selector: "app-majors",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./majors.component.html",
})
export class MajorsComponent implements OnInit {
  majors: Major[] = [];
  loading = true;
  error = "";
  search = "";

  showForm = false;
  editingId: number | null = null;
  draft: MajorDraft = { ...BLANK };
  saving = false;
  formError = "";

  subjectOptions: string[] = [];
  groupOptions: string[] = [];
  showAllSubjects = false;
  showAllGroups = false;
  readonly previewLimit = 25;

  get visibleSubjects(): string[] {
    return this.showAllSubjects
      ? this.subjectOptions
      : this.subjectOptions.slice(0, this.previewLimit);
  }

  get visibleGroups(): string[] {
    return this.showAllGroups
      ? this.groupOptions
      : this.groupOptions.slice(0, this.previewLimit);
  }

  constructor(
    private majorSvc: MajorService,
    private groupSvc: GroupService,
    private toastSvc: ToastService,
    private confirmSvc: ConfirmService,
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadLookups();
  }

  loadLookups(): void {
    this.majorSvc.getSubjects().subscribe({
      next: (subjects) => (this.subjectOptions = subjects),
      error: () => (this.subjectOptions = []),
    });
    this.groupSvc.getNames().subscribe({
      next: (names) => (this.groupOptions = names),
      error: () => (this.groupOptions = []),
    });
  }

  isSubjectChecked(subject: string): boolean {
    return this.draft.subjects.includes(subject);
  }

  toggleSubject(subject: string): void {
    const idx = this.draft.subjects.indexOf(subject);
    if (idx === -1) this.draft.subjects.push(subject);
    else this.draft.subjects.splice(idx, 1);
  }

  isGroupChecked(group: string): boolean {
    return this.draft.groups.includes(group);
  }

  toggleGroup(group: string): void {
    const idx = this.draft.groups.indexOf(group);
    if (idx === -1) this.draft.groups.push(group);
    else this.draft.groups.splice(idx, 1);
  }

  toggleShowSubjects(): void {
    this.showAllSubjects = !this.showAllSubjects;
  }

  toggleShowGroups(): void {
    this.showAllGroups = !this.showAllGroups;
  }

  load(): void {
    this.loading = true;
    this.error = "";
    this.majorSvc.getAll().subscribe({
      next: (data) => {
        this.majors = data;
        this.loading = false;
      },
      error: () => {
        this.error = "Could not load majors. Confirm the API is running.";
        this.loading = false;
      },
    });
  }

  get filtered(): Major[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.majors;
    return this.majors.filter(
      (m) =>
        m.majorName?.toLowerCase().includes(q) || String(m.majorId).includes(q),
    );
  }

  openCreate(): void {
    this.editingId = null;
    this.draft = { ...BLANK };
    this.formError = "";
    this.showAllSubjects = false;
    this.showAllGroups = false;
    this.showForm = true;
  }

  openEdit(m: Major): void {
    this.editingId = m.majorId;
    this.draft = {
      majorName: m.majorName,
      pricePerSemester: m.pricePerSemester,
      subjects: m.subjects ?? [],
      groups: m.group ?? [],
    };
    this.formError = "";
    this.showAllSubjects = false;
    this.showAllGroups = false;
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.formError = "";
  }

  save(): void {
    if (!this.draft.majorName.trim()) {
      this.formError = "Major name is required.";
      return;
    }
    this.saving = true;
    this.formError = "";

    const base = {
      majorName: this.draft.majorName,
      pricePerSemester: Number(this.draft.pricePerSemester) || 0,
      subjects: this.draft.subjects,
      group: this.draft.groups,
    };

    if (this.editingId === null) {
      const payload: Major = { majorId: 0, ...base };
      this.majorSvc.create(payload).subscribe({
        next: () => this.onSaved("Major added."),
        error: () => this.onSaveError(),
      });
    } else {
      const payload: Major = { majorId: this.editingId, ...base };
      this.majorSvc.update(this.editingId, payload).subscribe({
        next: () => this.onSaved("Major updated."),
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
