import { fetchApiWithAutoRefresh } from './apiClient';
import { GetLocationsResponse, CreateLocationResponse, UpdateLocationResponse, DeleteLocationResponse } from './types';

export function getLocations(
  accessToken: string | null,
  query?: {
    page?: number;
    limit?: number;
    room?: string;
    floor?: number;
    shelf?: number;
    row?: number;
  }
) {
  const params = new URLSearchParams();
  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());
  if (query?.room) params.append('room', query.room);
  if (query?.floor !== undefined) params.append('floor', query.floor.toString());
  if (query?.shelf !== undefined) params.append('shelf', query.shelf.toString());
  if (query?.row !== undefined) params.append('row', query.row.toString());

  const queryString = params.toString();
  return fetchApiWithAutoRefresh<GetLocationsResponse>(
    `/staff/location${queryString ? `?${queryString}` : ''}`,
    accessToken,
    {
      method: 'GET'
    }
  );
}

export function createLocation(
  accessToken: string | null,
  data: {
    room: string;
    floor: number;
    shelf: number;
    row: number;
  }
) {
  return fetchApiWithAutoRefresh<CreateLocationResponse>(`/staff/location`, accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function updateLocation(
  accessToken: string | null,
  locationId: string,
  data: {
    room: string;
    floor: number;
    shelf: number;
    row: number;
  }
) {
  return fetchApiWithAutoRefresh<UpdateLocationResponse>(`/staff/location/${locationId}`, accessToken, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function deleteLocation(accessToken: string | null, locationId: string) {
  return fetchApiWithAutoRefresh<DeleteLocationResponse>(`/staff/location/${locationId}`, accessToken, {
    method: 'DELETE'
  });
}
