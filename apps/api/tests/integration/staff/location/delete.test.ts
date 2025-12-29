import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';

describe('DELETE /api/staff/location/:location_id', async () => {
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

  it('should reject deletion when no token is provided', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/api/staff/location/A-1-1-1'
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject deletion when the user is a member', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/api/staff/location/A-1-1-1',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.MEMBER]}`
      }
    });

    expect(response.statusCode).toBe(403);
  });

  it.each([
    [Role.ADMIN, 'X', 1, 1, 1],
    [Role.LIBRARIAN, 'Y', 2, 2, 2]
  ])(
    'should delete a location when the user is %s',
    async (role: Role, room: string, floor: number, shelf: number, row: number) => {
      // First, create a new location to delete
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/staff/location',
        headers: {
          Authorization: `Bearer ${accessTokens[role]}`
        },
        payload: { room, floor, shelf, row }
      });

      expect(createResponse.statusCode).toBe(201);
      const locationId = createResponse.json().location_id;

      // Now, delete the created location
      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/api/staff/location/${locationId}`,
        headers: {
          Authorization: `Bearer ${accessTokens[role]}`
        }
      });

      expect(deleteResponse.statusCode).toBe(200);
      expect(deleteResponse.json()).toMatchObject({
        message: 'Location deleted successfully',
        data: {
          location_id: locationId,
          room,
          floor,
          shelf,
          row
        }
      });
    }
  );

  it('should return 404 when trying to delete a non-existing location', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/api/staff/location/NON-EXISTING-LOCATION',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      }
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: 'Not Found',
      message: 'Location with the given ID does not exist.',
      statusCode: 404
    });
  });
});
