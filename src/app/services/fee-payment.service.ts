import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api-config';
import { StudentFeePayment } from '../models/fee-payment.model';
import { PagedResult } from '../models/paged-result.model';
import { ListQuery, toHttpParams } from '../utils/list-query';

@Injectable({ providedIn: 'root' })
export class FeePaymentService {
  private readonly baseUrl = `${API_BASE_URL}/StudentFeePayment`;

  constructor(private http: HttpClient) {}

  getAll(query: ListQuery = {}): Observable<PagedResult<StudentFeePayment>> {
    return this.http.get<PagedResult<StudentFeePayment>>(this.baseUrl, {
      params: toHttpParams(query),
    });
  }

  getById(paymentId: number): Observable<StudentFeePayment> {
    return this.http.get<StudentFeePayment>(`${this.baseUrl}/${paymentId}`);
  }

  create(payment: StudentFeePayment): Observable<StudentFeePayment> {
    return this.http.post<StudentFeePayment>(this.baseUrl, payment);
  }

  update(
    paymentId: number,
    payment: StudentFeePayment
  ): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/${paymentId}`, payment);
  }

  delete(paymentId: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${paymentId}`);
  }
}