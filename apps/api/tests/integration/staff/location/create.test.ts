import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';

describe('POST /api/staff/location', async () => {
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

  it.each([
    { role: Role.ADMIN, room: 'A', floor: 1, shelf: 2, row: 3, expected: 'A-1-2-3' },
    { role: Role.LIBRARIAN, room: 'B', floor: 1, shelf: 2, row: 3, expected: 'B-1-2-3' }
  ])('should allow $role to create a new location', async ({ role, room, floor, shelf, row, expected }) => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/location',
      headers: {
        Authorization: `Bearer ${accessTokens[role]}`
      },
      payload: {
        room,
        floor,
        shelf,
        row
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      location_id: expected
    });
  });

  it('should prevent MEMBER from creating a new location', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/location',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.MEMBER]}`
      },
      payload: {
        room: 'A',
        floor: 1,
        shelf: 2,
        row: 3
      }
    });

    expect(response.statusCode).toBe(403);
  });

  it('should prevent creating a duplicate location', async () => {
    // First creation
    await app.inject({
      method: 'POST',
      url: '/api/staff/location',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: {
        room: 'B',
        floor: 1,
        shelf: 1,
        row: 1
      }
    });

    // Duplicate creation
    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/location',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: {
        room: 'B',
        floor: 1,
        shelf: 1,
        row: 1
      }
    });

    expect(response.statusCode).toBe(409);
  });
});
