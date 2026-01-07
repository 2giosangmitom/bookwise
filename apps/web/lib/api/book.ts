import { fetchApiWithAutoRefresh, fetchApi } from './apiClient';
import {
  GetBooksResponse,
  CreateBookResponse,
  UpdateBookResponse,
  DeleteBookResponse,
  GetNewBooksResponse
} from './types';

export function getBooks(accessToken: string | null, query?: { page?: number; limit?: number; searchTerm?: string }) {
  const page = query?.page ?? 1;
  const limit = query?.limit ?? 10;
  const searchTerm = query?.searchTerm ? `&searchTerm=${encodeURIComponent(query.searchTerm)}` : '';

  return fetchApiWithAutoRefresh<GetBooksResponse>(
    `/staff/book?limit=${limit}&page=${page}${searchTerm}`,
    accessToken,
    {
      method: 'GET'
    }
  );
}

export function createBook(
  accessToken: string | null,
  data: {
    title: string;
    description: string;
    isbn: string;
    published_at: string;
    publisher_id: string | null;
    authors?: string[];
    categories?: string[];
  }
) {
  return fetchApiWithAutoRefresh<CreateBookResponse>(`/staff/book`, accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function updateBook(
  accessToken: string | null,
  bookId: string,
  data: {
    title: string;
    description: string;
    isbn: string;
    published_at: string;
    publisher_id: string | null;
    authors?: string[];
    categories?: string[];
  }
) {
  return fetchApiWithAutoRefresh<UpdateBookResponse>(`/staff/book/${bookId}`, accessToken, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function deleteBook(accessToken: string | null, bookId: string) {
  return fetchApiWithAutoRefresh<DeleteBookResponse>(`/staff/book/${bookId}`, accessToken, {
    method: 'DELETE'
  });
}

export function uploadBookImage(accessToken: string | null, isbn: string, file: File) {
  const formData = new FormData();
  formData.append('image', file);

  return fetchApiWithAutoRefresh<UpdateBookResponse>(`/staff/book/${isbn}/image`, accessToken, {
    method: 'POST',
    body: formData
  });
}

// Public API endpoints
export function getNewBooks(limit: number = 8) {
  return fetchApi<GetNewBooksResponse>(`/book/new?limit=${limit}`, {
    method: 'GET'
  });
}
