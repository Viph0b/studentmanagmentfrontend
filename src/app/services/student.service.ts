import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api-config';
import { PagedResult } from '../models/paged-result.model';
import { Student } from '../models/student.model';
import { ListQuery, toHttpParams } from '../utils/list-query';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly baseUrl = `${API_BASE_URL}/Student`;

  constructor(private http: HttpClient) {}

  getAll(query: ListQuery = {}): Observable<PagedResult<Student>> {
    return this.http.get<PagedResult<Student>>(this.baseUrl, {
      params: toHttpParams(query),
    });
  }

  getById(studentId: number): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/${studentId}`);
  }

  create(student: Student): Observable<Student> {
    return this.http.post<Student>(this.baseUrl, student);
  }

  update(studentId: number, student: Student): Observable<Student> {
    return this.http.put<Student>(`${this.baseUrl}/${studentId}`, student);
  }

  delete(studentId: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${studentId}`);
  }
}