import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api-config';
import { ClassSchedule } from '../models/class-schedule.model';
import { PagedResult } from '../models/paged-result.model';
import { ListQuery, toHttpParams } from '../utils/list-query';

@Injectable({ providedIn: 'root' })
export class ClassScheduleService {
  private readonly baseUrl = `${API_BASE_URL}/ClassSchedule`;

  constructor(private http: HttpClient) {}

  getAll(query: ListQuery = {}): Observable<PagedResult<ClassSchedule>> {
    return this.http.get<PagedResult<ClassSchedule>>(this.baseUrl, {
      params: toHttpParams(query),
    });
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