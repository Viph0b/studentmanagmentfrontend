import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ClassScheduleService } from '../../services/class-schedule.service';
import { MajorService } from '../../services/major.service';
import { GroupService } from '../../services/group.service';
import { TeacherService } from '../../services/teacher.service';
import { SubjectService } from '../../services/subject.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmService } from '../../services/confirm.service';
import { ClassSchedule } from '../../models/class-schedule.model';
import { LabelValue } from '../../models/label-value.model';
import { Teacher } from '../../models/teacher.model';

type ScheduleDraft = {
  groupId: number;
  majorId: number;
  teacherId: number;
  subjectId: number;
  semester: number;
  academicYear: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  shift: string;
};

const BLANK: ScheduleDraft = {
  groupId: 0,
  majorId: 0,
  teacherId: 0,
  subjectId: 0,
  semester: 1,
  academicYear: '2025-2026',
  dayOfWeek: 'Monday',
  startTime: '08:00',
  endTime: '10:00',
  room: '',
  shift: 'Morning',
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule.component.html',
})
export class ScheduleComponent implements OnInit {
  days = DAYS;
  schedules: ClassSchedule[] = [];
  loading = true;
  error = '';
  search = '';

  majorOptions: LabelValue[] = [];
  groupOptions: LabelValue[] = [];
  subjectOptions: LabelValue[] = [];
  teachers: Teacher[] = [];

  showForm = false;
  editingId: number | null = null;
  draft: ScheduleDraft = { ...BLANK };
  saving = false;
  formError = '';

  constructor(
    private scheduleSvc: ClassScheduleService,
    private majorSvc: MajorService,
    private groupSvc: GroupService,
    private teacherSvc: TeacherService,
    private subjectSvc: SubjectService,
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
    this.groupSvc.getOptions().subscribe({
      next: (options) => (this.groupOptions = options),
      error: () => (this.groupOptions = []),
    });
    this.subjectSvc.getOptions().subscribe({
      next: (options) => (this.subjectOptions = options),
      error: () => (this.subjectOptions = []),
    });
    this.teacherSvc.getAll().subscribe({
      next: (teachers) => (this.teachers = teachers),
      error: () => (this.teachers = []),
    });
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.scheduleSvc.getAll().subscribe({
      next: (data) => {
        this.schedules = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load the schedule. Confirm the API is running.';
        this.loading = false;
      },
    });
  }

  get filtered(): ClassSchedule[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.schedules;
    return this.schedules.filter(
      (s) =>
        s.groupName?.toLowerCase().includes(q) ||
        s.subjectName?.toLowerCase().includes(q) ||
        s.teacherName?.toLowerCase().includes(q) ||
        s.room?.toLowerCase().includes(q)
    );
  }

  openCreate(): void {
    this.editingId = null;
    this.draft = { ...BLANK };
    this.formError = '';
    this.showForm = true;
  }

  openEdit(s: ClassSchedule): void {
    this.editingId = s.scheduleId;
    this.draft = {
      groupId: s.groupId,
      majorId: s.majorId,
      teacherId: s.teacherId,
      subjectId: s.subjectId,
      semester: s.semester,
      academicYear: s.academicYear,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room,
      shift: s.shift,
    };
    this.formError = '';
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.formError = '';
  }

  save(): void {
    if (!this.draft.groupId || !this.draft.subjectId) {
      this.formError = 'Group and subject are required.';
      return;
    }
    if (!this.draft.teacherId) {
      this.formError = 'Teacher is required.';
      return;
    }
    this.saving = true;
    this.formError = '';

    const base = {
      groupId: Number(this.draft.groupId) || 0,
      majorId: Number(this.draft.majorId) || 0,
      teacherId: Number(this.draft.teacherId) || 0,
      subjectId: Number(this.draft.subjectId) || 0,
      semester: Number(this.draft.semester) || 1,
      academicYear: this.draft.academicYear,
      dayOfWeek: this.draft.dayOfWeek,
      startTime: this.draft.startTime,
      endTime: this.draft.endTime,
      room: this.draft.room,
      shift: this.draft.shift,
    };

    if (this.editingId === null) {
      const payload: ClassSchedule = { scheduleId: 0, ...base };
      this.scheduleSvc.create(payload).subscribe({
        next: () => this.onSaved('Class scheduled.'),
        error: () => this.onSaveError(),
      });
    } else {
      const payload: ClassSchedule = { scheduleId: this.editingId, ...base };
      this.scheduleSvc.update(this.editingId, payload).subscribe({
        next: () => this.onSaved('Schedule updated.'),
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

  remove(s: ClassSchedule): void {
    this.confirmSvc.confirm({
      title: 'Remove session',
      message: `Remove the ${s.subjectName} session for ${s.groupName}? This cannot be undone.`,
      confirmLabel: 'Remove',
      danger: true,
    }).subscribe((confirmed) => {
      if (!confirmed) return;
      this.scheduleSvc.delete(s.scheduleId).subscribe({
        next: () => {
          this.toastSvc.success('Schedule entry removed.');
          this.load();
        },
        error: () => {
          this.toastSvc.error('Delete failed. Please try again.');
        },
      });
    });
  }
}