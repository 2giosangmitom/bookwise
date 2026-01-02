import { fetchApiWithAutoRefresh } from './apiClient';
import { GetCategoriesResponse } from './types';

export function getCategories(accessToken: string | null, query?: { page: number }) {
  return fetchApiWithAutoRefresh<GetCategoriesResponse>(
    `/staff/category?limit=10&page=${query?.page ?? 1}`,
    accessToken,
    {
      method: 'GET'
    }
  );
}
