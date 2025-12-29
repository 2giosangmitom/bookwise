import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';

describe('PUT /api/staff/location/:location_id', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};

  afterAll(async () => {
    await app.close();
  });

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);
    accessTokens[Role.LIBRARIAN] = await getAccessToken(app, users[1]);
    accessTokens[Role.MEMBER] = await getAccessToken(app, users[4]);
  });

  it('should reject update when no token is provided', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/api/staff/location/A-1-1-1',
      payload: {
        room: 'B',
        floor: 2,
        shelf: 2,
        row: 2
      }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject update when the user is a member', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/api/staff/location/A-1-1-1',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.MEMBER]}`
      },
      payload: {
        room: 'B',
        floor: 2,
        shelf: 2,
        row: 2
      }
    });

    expect(response.statusCode).toBe(403);
  });

  it.each([
    { role: Role.ADMIN, createRoom: 'U', updateRoom: 'V', floor: 2, shelf: 3, row: 4 },
    { role: Role.LIBRARIAN, createRoom: 'W', updateRoom: 'X', floor: 5, shelf: 6, row: 7 }
  ])('should update a location when the user is $role', async ({ role, createRoom, updateRoom, floor, shelf, row }) => {
    // First, create a new location to update
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/location',
      headers: {
        Authorization: `Bearer ${accessTokens[role]}`
      },
      payload: {
        room: createRoom,
        floor: 1,
        shelf: 1,
        row: 1
      }
    });

    expect(createResponse.statusCode).toBe(201);
    const locationId = createResponse.json().location_id;

    // Now, update the created location
    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/location/${locationId}`,
      headers: {
        Authorization: `Bearer ${accessTokens[role]}`
      },
      payload: {
        room: updateRoom,
        floor,
        shelf,
        row
      }
    });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json()).toMatchObject({
      message: 'Location updated successfully',
      data: {
        location_id: `${updateRoom}-${floor}-${shelf}-${row}`,
        room: updateRoom,
        floor,
        shelf,
        row
      }
    });
  });

  it('should return 404 when trying to update a non-existing location', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/api/staff/location/NON-EXISTING-LOCATION',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: {
        room: 'Z',
        floor: 1,
        shelf: 1,
        row: 1
      }
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: 'Not Found',
      message: 'Location with the given ID does not exist.',
      statusCode: 404
    });
  });

  it('should return 409 when updating to a location_id that already exists', async () => {
    // Create two locations
    await app.inject({
      method: 'POST',
      url: '/api/staff/location',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: {
        room: 'CONFLICT',
        floor: 1,
        shelf: 1,
        row: 1
      }
    });

    const createResponse2 = await app.inject({
      method: 'POST',
      url: '/api/staff/location',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: {
        room: 'CONFLICT',
        floor: 2,
        shelf: 2,
        row: 2
      }
    });

    const locationId2 = createResponse2.json().location_id;

    // Try to update second location to match first location's ID
    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/location/${locationId2}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: {
        room: 'CONFLICT',
        floor: 1,
        shelf: 1,
        row: 1
      }
    });

    expect(updateResponse.statusCode).toBe(409);
    expect(updateResponse.json()).toMatchObject({
      error: 'Conflict',
      message: 'Location with the same ID already exists.',
      statusCode: 409
    });
  });
});
