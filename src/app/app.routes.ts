import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'students',
    loadComponent: () =>
      import('./pages/students/students.component').then(
        (m) => m.StudentsComponent
      ),
  },
  {
    path: 'teachers',
    loadComponent: () =>
      import('./pages/teachers/teachers.component').then(
        (m) => m.TeachersComponent
      ),
  },
  {
    path: 'majors',
    loadComponent: () =>
      import('./pages/majors/majors.component').then(
        (m) => m.MajorsComponent
      ),
  },
  {
    path: 'groups',
    loadComponent: () =>
      import('./pages/groups/groups.component').then(
        (m) => m.GroupsComponent
      ),
  },
  {
    path: 'subjects',
    loadComponent: () =>
      import('./pages/subjects/subjects.component').then(
        (m) => m.SubjectsComponent
      ),
  },
  {
    path: 'schedule',
    loadComponent: () =>
      import('./pages/schedule/schedule.component').then(
        (m) => m.ScheduleComponent
      ),
  },
  {
    path: 'payments',
    loadComponent: () =>
      import('./pages/payments/payments.component').then(
        (m) => m.PaymentsComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
