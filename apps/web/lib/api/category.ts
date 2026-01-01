import { fetchApi } from './apiClient';

export function getCategories() {
  return fetchApi('/categories', {
    method: 'GET'
  });
}
