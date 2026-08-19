import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api-config';
import { LabelValue } from '../models/label-value.model';
import { PagedResult } from '../models/paged-result.model';
import { Teacher } from '../models/teacher.model';
import { ListQuery, toHttpParams } from '../utils/list-query';

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private readonly baseUrl = `${API_BASE_URL}/Teacher`;

  constructor(private http: HttpClient) {}

  getAll(query: ListQuery = {}): Observable<PagedResult<Teacher>> {
    return this.http.get<PagedResult<Teacher>>(this.baseUrl, {
      params: toHttpParams(query),
    });
  }

  getOptions(): Observable<LabelValue[]> {
    return this.http.get<LabelValue[]>(`${this.baseUrl}/getteacheroptions`);
  }

  getById(teacherId: number): Observable<Teacher> {
    return this.http.get<Teacher>(`${this.baseUrl}/${teacherId}`);
  }

  create(teacher: Teacher): Observable<Teacher> {
    return this.http.post<Teacher>(this.baseUrl, teacher);
  }

  update(teacherId: number, teacher: Teacher): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/${teacherId}`, teacher);
  }

  delete(teacherId: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${teacherId}`);
  }
}