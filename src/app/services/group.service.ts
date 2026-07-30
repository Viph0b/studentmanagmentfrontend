import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api-config';
import { Group } from '../models/group.model';

@Injectable({ providedIn: 'root' })
export class GroupService {
  private readonly baseUrl = `${API_BASE_URL}/Group`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Group[]> {
    return this.http.get<Group[]>(this.baseUrl);
  }

  getById(groupId: number): Observable<Group> {
    return this.http.get<Group>(`${this.baseUrl}/${groupId}`);
  }

  create(group: Group): Observable<Group> {
    return this.http.post<Group>(this.baseUrl, group);
  }

  update(groupId: number, group: Group): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/${groupId}`, group);
  }

  delete(groupId: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${groupId}`);
  }
}
