import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api-config';
import { StudentFeePayment } from '../models/fee-payment.model';

@Injectable({ providedIn: 'root' })
export class FeePaymentService {
  private readonly baseUrl = `${API_BASE_URL}/StudentFeePayment`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<StudentFeePayment[]> {
    return this.http.get<StudentFeePayment[]>(this.baseUrl);
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
