import { fetchApiWithAutoRefresh } from './apiClient';
import { GetCategoriesResponse } from './types';

export function getCategories(accessToken: string | null) {
  return fetchApiWithAutoRefresh<GetCategoriesResponse>('/staff/category?limit=10', accessToken, {
    method: 'GET'
  });
}
