import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { StudentService } from '../../services/student.service';
import { TeacherService } from '../../services/teacher.service';
import { MajorService } from '../../services/major.service';
import { GroupService } from '../../services/group.service';
import { ClassScheduleService } from '../../services/class-schedule.service';
import { FeePaymentService } from '../../services/fee-payment.service';

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
    { no: '02', label: 'Students', path: '/students', count: null, desc: 'Enrolled learner records', icon: '👨‍🎓' },
    { no: '03', label: 'Teachers', path: '/teachers', count: null, desc: 'Faculty roster', icon: '👩‍🏫' },
    { no: '04', label: 'Majors', path: '/majors', count: null, desc: 'Programs of study', icon: '📚' },
    { no: '05', label: 'Groups', path: '/groups', count: null, desc: 'Class cohorts', icon: '👥' },
    { no: '06', label: 'Class schedule', path: '/schedule', count: null, desc: 'Weekly timetable entries', icon: '📅' },
    { no: '07', label: 'Fee payments', path: '/payments', count: null, desc: 'Recorded transactions', icon: '💳' },
  ];

  constructor(
    private studentSvc: StudentService,
    private teacherSvc: TeacherService,
    private majorSvc: MajorService,
    private groupSvc: GroupService,
    private scheduleSvc: ClassScheduleService,
    private paymentSvc: FeePaymentService
  ) {}

  ngOnInit(): void {
    forkJoin({
      students: this.studentSvc.getAll(),
      teachers: this.teacherSvc.getAll(),
      majors: this.majorSvc.getAll(),
      groups: this.groupSvc.getAll(),
      schedule: this.scheduleSvc.getAll(),
      payments: this.paymentSvc.getAll(),
    }).subscribe({
      next: (res) => {
        this.tiles[0].count = res.students.length;
        this.tiles[1].count = res.teachers.length;
        this.tiles[2].count = res.majors.length;
        this.tiles[3].count = res.groups.length;
        this.tiles[4].count = res.schedule.length;
        this.tiles[5].count = res.payments.length;
        this.loading = false;
      },
      error: () => {
        this.error =
          'Could not reach the API. Confirm the backend is running at http://localhost:5073 and CORS allows http://localhost:4200.';
        this.loading = false;
      },
    });
  }
}
