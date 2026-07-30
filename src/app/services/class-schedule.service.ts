import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api-config';
import { ClassSchedule } from '../models/class-schedule.model';

@Injectable({ providedIn: 'root' })
export class ClassScheduleService {
  private readonly baseUrl = `${API_BASE_URL}/ClassSchedule`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ClassSchedule[]> {
    return this.http.get<ClassSchedule[]>(this.baseUrl);
  }

  getById(scheduleId: number): Observable<ClassSchedule> {
    return this.http.get<ClassSchedule>(`${this.baseUrl}/${scheduleId}`);
  }

  create(schedule: ClassSchedule): Observable<ClassSchedule> {
    return this.http.post<ClassSchedule>(this.baseUrl, schedule);
  }

  update(scheduleId: number, schedule: ClassSchedule): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/${scheduleId}`, schedule);
  }

  delete(scheduleId: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${scheduleId}`);
  }
}
