import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { API_BASE_URL } from "../api-config";
import { Subject } from "../models/subject.model";
import { LabelValue } from "../models/label-value.model";

@Injectable({ providedIn: "root" })
export class SubjectService {
  private readonly baseUrl = `${API_BASE_URL}/Subject`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Subject[]> {
    return this.http.get<Subject[]>(this.baseUrl);
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
