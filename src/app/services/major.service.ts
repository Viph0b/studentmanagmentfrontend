import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { API_BASE_URL } from "../api-config";
import { Major } from "../models/major.model";
import { LabelValue } from "../models/label-value.model";
import { PagedResult } from "../models/paged-result.model";
import { ListQuery, toHttpParams } from "../utils/list-query";

@Injectable({ providedIn: "root" })
export class MajorService {
  private readonly baseUrl = `${API_BASE_URL}/Major`;

  constructor(private http: HttpClient) {}

  getAll(query: ListQuery = {}): Observable<PagedResult<Major>> {
    return this.http.get<PagedResult<Major>>(this.baseUrl, {
      params: toHttpParams(query),
    });
  }

  getOptions(): Observable<LabelValue[]> {
    return this.http.get<LabelValue[]>(`${this.baseUrl}/getmajoroptions`);
  }

  getSubjects(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/getmajorsubjects`);
  }

  getById(majorId: number): Observable<Major> {
    return this.http.get<Major>(`${this.baseUrl}/${majorId}`);
  }

  create(major: Major): Observable<Major> {
    return this.http.post<Major>(this.baseUrl, major);
  }

  update(majorId: number, major: Major): Observable<Major> {
    return this.http.put<Major>(`${this.baseUrl}/${majorId}`, major);
  }

  delete(majorId: number): Observable<string | null> {
    return this.http.delete(`${this.baseUrl}/${majorId}`, {
      responseType: "text",
    });
  }
}