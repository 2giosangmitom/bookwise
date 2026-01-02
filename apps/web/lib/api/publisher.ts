import { fetchApiWithAutoRefresh } from './apiClient';
import {
  GetPublishersResponse,
  DeletePublisherResponse,
  CreatePublisherResponse,
  UpdatePublisherResponse
} from './types';

export function getPublishers(
  accessToken: string | null,
  query?: { page: number; limit?: number; searchTerm?: string }
) {
  const params = new URLSearchParams();
  params.append('limit', String(query?.limit ?? 10));
  params.append('page', String(query?.page ?? 1));
  if (query?.searchTerm) params.append('searchTerm', query.searchTerm);

  return fetchApiWithAutoRefresh<GetPublishersResponse>(`/staff/publisher?${params.toString()}`, accessToken, {
    method: 'GET'
  });
}

export function deletePublisher(accessToken: string | null, publisherId: string) {
  return fetchApiWithAutoRefresh<DeletePublisherResponse>(`/staff/publisher/${publisherId}`, accessToken, {
    method: 'DELETE'
  });
}

export function createPublisher(accessToken: string | null, data: { name: string; website: string; slug: string }) {
  return fetchApiWithAutoRefresh<CreatePublisherResponse>(`/staff/publisher`, accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function updatePublisher(
  accessToken: string | null,
  publisherId: string,
  data: { name: string; website: string; slug: string }
) {
  return fetchApiWithAutoRefresh<UpdatePublisherResponse>(`/staff/publisher/${publisherId}`, accessToken, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
