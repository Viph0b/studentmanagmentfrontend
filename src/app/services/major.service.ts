import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { API_BASE_URL } from "../api-config";
import { Major } from "../models/major.model";

@Injectable({ providedIn: "root" })
export class MajorService {
  private readonly baseUrl = `${API_BASE_URL}/Major`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Major[]> {
    return this.http.get<Major[]>(this.baseUrl);
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
