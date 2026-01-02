import { fetchApiWithAutoRefresh } from './apiClient';
import { GetCategoriesResponse, DeleteCategoryResponse } from './types';

export function getCategories(
  accessToken: string | null,
  query?: { page: number; limit?: number; searchTerm?: string }
) {
  return fetchApiWithAutoRefresh<GetCategoriesResponse>(
    `/staff/category?limit=${query?.limit ?? 10}&page=${query?.page ?? 1}${query?.searchTerm ? `&searchTerm=${encodeURIComponent(query.searchTerm)}` : ''}`,
    accessToken,
    {
      method: 'GET'
    }
  );
}

export function deleteCategory(accessToken: string | null, categoryId: string) {
  return fetchApiWithAutoRefresh<DeleteCategoryResponse>(`/staff/category/${categoryId}`, accessToken, {
    method: 'DELETE'
  });
}

export function createCategory(accessToken: string | null, data: { name: string; slug: string }) {
  return fetchApiWithAutoRefresh<GetCategoriesResponse>(`/staff/category`, accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function updateCategory(accessToken: string | null, categoryId: string, data: { name: string; slug: string }) {
  return fetchApiWithAutoRefresh<GetCategoriesResponse>(`/staff/category/${categoryId}`, accessToken, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
