import { fetchApiWithAutoRefresh } from './apiClient';
import {
  GetBookClonesResponse,
  CreateBookCloneResponse,
  UpdateBookCloneResponse,
  DeleteBookCloneResponse,
  GetBookCloneConditionStatsResponse
} from './types';

export function getBookClones(
  accessToken: string | null,
  query?: {
    page?: number;
    limit?: number;
    searchTerm?: string;
    condition?: string;
    is_available?: boolean;
  }
) {
  const params = new URLSearchParams();
  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());
  if (query?.searchTerm) params.append('searchTerm', query.searchTerm);
  if (query?.condition) params.append('condition', query.condition);
  if (typeof query?.is_available === 'boolean') params.append('is_available', query.is_available.toString());

  const queryString = params.toString();
  return fetchApiWithAutoRefresh<GetBookClonesResponse>(
    `/staff/book_clone${queryString ? `?${queryString}` : ''}`,
    accessToken,
    {
      method: 'GET'
    }
  );
}

export function createBookClone(
  accessToken: string | null,
  data: {
    book_id: string;
    location_id: string;
    barcode: string;
    condition: string;
  }
) {
  return fetchApiWithAutoRefresh<CreateBookCloneResponse>(`/staff/book_clone`, accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function updateBookClone(
  accessToken: string | null,
  bookCloneId: string,
  data: {
    book_id: string;
    location_id: string;
    barcode: string;
    condition: string;
  }
) {
  return fetchApiWithAutoRefresh<UpdateBookCloneResponse>(`/staff/book_clone/${bookCloneId}`, accessToken, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function deleteBookClone(accessToken: string | null, bookCloneId: string) {
  return fetchApiWithAutoRefresh<DeleteBookCloneResponse>(`/staff/book_clone/${bookCloneId}`, accessToken, {
    method: 'DELETE'
  });
}

export function getBookCloneConditionStats(accessToken: string | null) {
  return fetchApiWithAutoRefresh<GetBookCloneConditionStatsResponse>('/staff/book_clone/stats/condition', accessToken, {
    method: 'GET'
  });
}
