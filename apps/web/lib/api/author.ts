import { fetchApiWithAutoRefresh } from './apiClient';
import { GetAuthorsResponse, CreateAuthorResponse, UpdateAuthorResponse, DeleteAuthorResponse } from './types';

export function getAuthors(
  accessToken: string | null,
  query?: { page: number; limit?: number; searchTerm?: string; is_alive?: boolean }
) {
  const params = new URLSearchParams({
    limit: String(query?.limit ?? 10),
    page: String(query?.page ?? 1)
  });

  if (query?.searchTerm) {
    params.append('searchTerm', query.searchTerm);
  }

  if (query?.is_alive !== undefined) {
    params.append('is_alive', String(query.is_alive));
  }

  return fetchApiWithAutoRefresh<GetAuthorsResponse>(`/staff/author?${params.toString()}`, accessToken, {
    method: 'GET'
  });
}

export function createAuthor(
  accessToken: string | null,
  data: {
    name: string;
    short_biography: string;
    biography: string;
    date_of_birth: string | null;
    date_of_death: string | null;
    nationality: string | null;
    slug: string;
  }
) {
  return fetchApiWithAutoRefresh<CreateAuthorResponse>(`/staff/author`, accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function updateAuthor(
  accessToken: string | null,
  authorId: string,
  data: {
    name: string;
    short_biography: string;
    biography: string;
    date_of_birth: string | null;
    date_of_death: string | null;
    nationality: string | null;
    slug: string;
  }
) {
  return fetchApiWithAutoRefresh<UpdateAuthorResponse>(`/staff/author/${authorId}`, accessToken, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function deleteAuthor(accessToken: string | null, authorId: string) {
  return fetchApiWithAutoRefresh<DeleteAuthorResponse>(`/staff/author/${authorId}`, accessToken, {
    method: 'DELETE'
  });
}
