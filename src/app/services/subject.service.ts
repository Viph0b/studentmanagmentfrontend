import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { API_BASE_URL } from "../api-config";
import { LabelValue } from "../models/label-value.model";
import { PagedResult } from "../models/paged-result.model";
import { Subject } from "../models/subject.model";
import { ListQuery, toHttpParams } from "../utils/list-query";

@Injectable({ providedIn: "root" })
export class SubjectService {
  private readonly baseUrl = `${API_BASE_URL}/Subject`;

  constructor(private http: HttpClient) {}

  getAll(query: ListQuery = {}): Observable<PagedResult<Subject>> {
    return this.http.get<PagedResult<Subject>>(this.baseUrl, {
      params: toHttpParams(query),
    });
  }

  getOptions(): Observable<LabelValue[]> {
    return this.http.get<LabelValue[]>(`${this.baseUrl}/getsubjectoptions`);
  }

  getById(subjectId: number): Observable<Subject> {
    return this.http.get<Subject>(`${this.baseUrl}/${subjectId}`);
  }

  create(subject: Subject): Observable<Subject> {
    return this.http.post<Subject>(this.baseUrl, subject);
  }

  update(subjectId: number, subject: Subject): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/${subjectId}`, subject);
  }

  delete(subjectId: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${subjectId}`);
  }
}