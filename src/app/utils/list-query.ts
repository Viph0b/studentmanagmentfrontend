import { HttpParams } from '@angular/common/http';

import { SortOrder } from './sort';

export interface ListQuery {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: SortOrder;
  [key: string]: unknown;
}

export function toHttpParams(query: ListQuery): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params = params.set(key, String(value));
  }
  return params;
}