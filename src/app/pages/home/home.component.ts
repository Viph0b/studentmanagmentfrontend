import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

import { StudentService } from '../../services/student.service';
import { TeacherService } from '../../services/teacher.service';
import { MajorService } from '../../services/major.service';
import { GroupService } from '../../services/group.service';
import { SubjectService } from '../../services/subject.service';
import { ClassScheduleService } from '../../services/class-schedule.service';
import { FeePaymentService } from '../../services/fee-payment.service';
import { PagedResult } from '../../models/paged-result.model';

interface Tile {
  no: string;
  label: string;
  path: string;
  count: number | null;
  desc: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  loading = true;
  error = '';

  tiles: Tile[] = [
    { no: '02', label: 'Students', path: '/students', count: null, desc: 'Enrolled learner records', icon: 'M226.53,56.41l-96-32a8,8,0,0,0-5.06,0l-96,32A8,8,0,0,0,24,64v80a8,8,0,0,0,16,0V75.1L73.59,86.29a64,64,0,0,0,20.65,88.05c-18,7.06-33.56,19.83-44.94,37.29a8,8,0,1,0,13.4,8.74C77.77,197.25,101.57,184,128,184s50.23,13.25,65.3,36.37a8,8,0,0,0,13.4-8.74c-11.38-17.46-27-30.23-44.94-37.29a64,64,0,0,0,20.65-88l44.12-14.7a8,8,0,0,0,0-15.18ZM176,120A48,48,0,1,1,89.35,91.55l36.12,12a8,8,0,0,0,5.06,0l36.12-12A47.89,47.89,0,0,1,176,120ZM128,87.57,57.3,64,128,40.43,198.7,64Z' },
    { no: '03', label: 'Teachers', path: '/teachers', count: null, desc: 'Faculty roster', icon: 'M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H53.39a8,8,0,0,0,7.23-4.57,48,48,0,0,1,86.76,0,8,8,0,0,0,7.23,4.57H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM80,144a24,24,0,1,1,24,24A24,24,0,0,1,80,144Zm136,56H159.43a64.39,64.39,0,0,0-28.83-26.16,40,40,0,1,0-53.2,0A64.39,64.39,0,0,0,48.57,200H40V56H216ZM56,96V80a8,8,0,0,1,8-8H192a8,8,0,0,1,8,8v96a8,8,0,0,1-8,8H176a8,8,0,0,1,0-16h8V88H72v8a8,8,0,0,1-16,0Z' },
    { no: '04', label: 'Majors', path: '/majors', count: null, desc: 'Programs of study', icon: 'M231.65,194.55,198.46,36.75a16,16,0,0,0-19-12.39L132.65,34.42a16.08,16.08,0,0,0-12.3,19l33.19,157.8A16,16,0,0,0,169.16,224a16.25,16.25,0,0,0,3.38-.36l46.81-10.06A16.09,16.09,0,0,0,231.65,194.55ZM136,50.15c0-.06,0-.09,0-.09l46.8-10,3.33,15.87L139.33,66Zm6.62,31.47,46.82-10.05,3.34,15.9L146,97.53Zm6.64,31.57,46.82-10.06,13.3,63.24-46.82,10.06ZM216,197.94l-46.8,10-3.33-15.87L212.67,182,216,197.85C216,197.91,216,197.94,216,197.94ZM104,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V48A16,16,0,0,0,104,32ZM56,48h48V64H56Zm0,32h48v96H56Zm48,128H56V192h48v16Z' },
    { no: '05', label: 'Groups', path: '/groups', count: null, desc: 'Class cohorts', icon: 'M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1-7.37-4.89,8,8,0,0,1,0-6.22A8,8,0,0,1,192,112a24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.84,8,57,57,0,0,0-98.16,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,1,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,1,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z' },
    { no: '06', label: 'Subjects', path: '/subjects', count: null, desc: 'Course catalog', icon: 'M208,24H72A32,32,0,0,0,40,56V224a8,8,0,0,0,8,8H192a8,8,0,0,0,0-16H56a16,16,0,0,1,16-16H208a8,8,0,0,0,8-8V32A8,8,0,0,0,208,24Zm-8,160H72a31.82,31.82,0,0,0-16,4.29V56A16,16,0,0,1,72,40H200Z' },
    { no: '07', label: 'Schedule', path: '/schedule', count: null, desc: 'Weekly timetable entries', icon: 'M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-96-88v64a8,8,0,0,1-16,0V132.94l-4.42,2.22a8,8,0,0,1-7.16-14.32l16-8A8,8,0,0,1,112,120Zm59.16,30.45L152,176h16a8,8,0,0,1,0,16H136a8,8,0,0,1-6.4-12.8l28.78-38.37A8,8,0,1,0,145.07,132a8,8,0,1,1-13.85-8A24,24,0,0,1,176,136,23.76,23.76,0,0,1,171.16,150.45Z' },
    { no: '08', label: 'Payments', path: '/payments', count: null, desc: 'Recorded transactions', icon: 'M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,16V88H32V64Zm0,128H32V104H224v88Zm-16-24a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h32A8,8,0,0,1,208,168Zm-64,0a8,8,0,0,1-8,8H120a8,8,0,0,1,0-16h16A8,8,0,0,1,144,168Z' },
  ];

  constructor(
    private studentSvc: StudentService,
    private teacherSvc: TeacherService,
    private majorSvc: MajorService,
    private groupSvc: GroupService,
    private subjectSvc: SubjectService,
    private scheduleSvc: ClassScheduleService,
    private paymentSvc: FeePaymentService
  ) {}

  ngOnInit(): void {
    forkJoin({
      students: this.count(this.studentSvc.getAll()),
      teachers: this.count(this.teacherSvc.getAll()),
      majors: this.count(this.majorSvc.getAll()),
      groups: this.count(this.groupSvc.getAll()),
      subjects: this.count(this.subjectSvc.getAll()),
      schedule: this.count(this.scheduleSvc.getAll()),
      payments: this.count(this.paymentSvc.getAll()),
    }).subscribe({
      next: (res) => {
        this.tiles[0].count = res.students;
        this.tiles[1].count = res.teachers;
        this.tiles[2].count = res.majors;
        this.tiles[3].count = res.groups;
        this.tiles[4].count = res.subjects;
        this.tiles[5].count = res.schedule;
        this.tiles[6].count = res.payments;
        this.loading = false;
        const counts = [res.students, res.teachers, res.majors, res.groups, res.subjects, res.schedule, res.payments];
        if (counts.every((c) => c === null)) {
          this.error =
            'Could not reach the API. Confirm the backend is running at http://localhost:5073 and CORS allows http://localhost:4200.';
        } else if (counts.some((c) => c === null)) {
          this.error = 'Some sections could not be loaded.';
        }
      },
    });
  }

  trackByTile(_index: number, item: Tile): string {
    return item.path;
  }

  private count(source: Observable<PagedResult<unknown>>): Observable<number | null> {
    return source.pipe(
      map((result) => result.total),
      catchError(() => of(null)),
    );
  }
}
