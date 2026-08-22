import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let message = 'An unexpected error occurred.';

      if (err.status === 0) {
        message = 'Cannot reach the server. Check the API connection.';
      } else if (err.status === 400) {
        message = err.error?.message ?? 'Invalid request. Check your input.';
      } else if (err.status === 404) {
        message = err.error?.message ?? 'Resource not found.';
      } else if (err.status === 409) {
        message = err.error?.message ?? 'Conflict. The resource is in use.';
      } else if (err.status >= 500) {
        message = 'Server error. Please try again later.';
      }

      toast.error(message);
      return throwError(() => err);
    }),
  );
};
