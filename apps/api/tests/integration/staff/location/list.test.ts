import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('GET /api/staff/location', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};
  let createdLocationIds: string[] = [];

  const createLocationForTest = async (
    overrides: Partial<{
      room: string;
      floor: number;
      shelf: number;
      row: number;
    }> = {}
  ) => {
    const payload = {
      room: overrides.room ?? faker.helpers.arrayElement(['Main Hall', 'Study Room', 'Archive']),
      floor: overrides.floor ?? faker.number.int({ min: 1, max: 5 }),
      shelf: overrides.shelf ?? faker.number.int({ min: 1, max: 20 }),
      row: overrides.row ?? faker.number.int({ min: 1, max: 10 })
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/location',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    createdLocationIds.push(body.location_id);
    return body;
  };

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);
    accessTokens[Role.LIBRARIAN] = await getAccessToken(app, users[1]);
    accessTokens[Role.MEMBER] = await getAccessToken(app, users[4]);
  });

  afterEach(async () => {
    if (createdLocationIds.length > 0) {
      await app.prisma.location.deleteMany({ where: { location_id: { in: createdLocationIds } } });
      createdLocationIds = [];
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthenticated requests', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/location'
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject member role', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/location',
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` }
    });

    expect(response.statusCode).toBe(403);
  });

  it('should list locations with pagination', async () => {
    await createLocationForTest({ room: 'Test Room A', floor: 1, shelf: 1, row: 1 });
    await createLocationForTest({ room: 'Test Room A', floor: 1, shelf: 1, row: 2 });
    await createLocationForTest({ room: 'Test Room A', floor: 1, shelf: 1, row: 3 });

    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/location',
      query: {
        limit: '2',
        page: '1'
      },
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data).toHaveLength(2);
    expect(body.meta.totalPages).toBeGreaterThanOrEqual(2);
    expect(body.message).toBe('Locations retrieved successfully');
  });

  it('should filter locations by room', async () => {
    const marker = faker.string.alphanumeric(6).toUpperCase();

    const created1 = await createLocationForTest({
      room: `Archive ${marker}`,
      floor: 2,
      shelf: 5,
      row: 3
    });
    await createLocationForTest({
      room: 'Main Hall',
      floor: 1,
      shelf: 1,
      row: 1
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/location',
      query: {
        room: `Archive ${marker}`
      },
      headers: { Authorization: `Bearer ${accessTokens[Role.LIBRARIAN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.some((l: { location_id: string }) => l.location_id === created1.location_id)).toBe(true);
  });

  it('should filter locations by floor', async () => {
    const created = await createLocationForTest({
      room: 'Test Floor',
      floor: 3,
      shelf: 1,
      row: 1
    });
    await createLocationForTest({
      room: 'Test Floor',
      floor: 1,
      shelf: 1,
      row: 1
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/location',
      query: {
        floor: '3'
      },
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.some((l: { location_id: string }) => l.location_id === created.location_id)).toBe(true);
  });

  it('should filter locations by shelf', async () => {
    const created = await createLocationForTest({
      room: 'Test Shelf',
      floor: 1,
      shelf: 15,
      row: 1
    });
    await createLocationForTest({
      room: 'Test Shelf',
      floor: 1,
      shelf: 5,
      row: 1
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/location',
      query: {
        shelf: '15'
      },
      headers: { Authorization: `Bearer ${accessTokens[Role.LIBRARIAN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.some((l: { location_id: string }) => l.location_id === created.location_id)).toBe(true);
  });

  it('should filter locations by row', async () => {
    const created = await createLocationForTest({
      room: 'Test Row',
      floor: 1,
      shelf: 1,
      row: 8
    });
    await createLocationForTest({
      room: 'Test Row',
      floor: 1,
      shelf: 1,
      row: 2
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/location',
      query: {
        row: '8'
      },
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.some((l: { location_id: string }) => l.location_id === created.location_id)).toBe(true);
  });

  it('should combine multiple filters', async () => {
    const marker = faker.string.alphanumeric(6).toUpperCase();

    const created = await createLocationForTest({
      room: `Combo ${marker}`,
      floor: 2,
      shelf: 10,
      row: 5
    });
    await createLocationForTest({
      room: `Combo ${marker}`,
      floor: 2,
      shelf: 10,
      row: 6
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/location',
      query: {
        room: `Combo ${marker}`,
        floor: '2',
        shelf: '10',
        row: '5'
      },
      headers: { Authorization: `Bearer ${accessTokens[Role.LIBRARIAN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0].location_id).toBe(created.location_id);
  });

  it('should support case-insensitive room search', async () => {
    const marker = faker.string.alphanumeric(6).toUpperCase();

    const created = await createLocationForTest({
      room: `UPPERCASE ${marker}`,
      floor: 1,
      shelf: 1,
      row: 1
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/location',
      query: {
        room: `uppercase ${marker.toLowerCase()}`
      },
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.some((l: { location_id: string }) => l.location_id === created.location_id)).toBe(true);
  });

  it('should return correct response format', async () => {
    await createLocationForTest();

    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/location',
      query: { limit: '10', page: '1' },
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();

    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('meta');
    expect(body).toHaveProperty('data');
    expect(body.meta).toHaveProperty('totalPages');
    expect(Array.isArray(body.data)).toBe(true);

    if (body.data.length > 0) {
      const location = body.data[0];
      expect(location).toHaveProperty('location_id');
      expect(location).toHaveProperty('room');
      expect(location).toHaveProperty('floor');
      expect(location).toHaveProperty('shelf');
      expect(location).toHaveProperty('row');
      expect(location).toHaveProperty('created_at');
      expect(location).toHaveProperty('updated_at');
    }
  });

  it('should handle pagination correctly', async () => {
    for (let i = 0; i < 5; i++) {
      await createLocationForTest({
        room: 'Pagination Test',
        floor: 1,
        shelf: 1,
        row: i + 1
      });
    }

    const page1Response = await app.inject({
      method: 'GET',
      url: '/api/staff/location',
      query: {
        limit: '2',
        page: '1'
      },
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(page1Response.statusCode).toBe(200);
    const page1Body = page1Response.json();
    expect(page1Body.data).toHaveLength(2);

    const page2Response = await app.inject({
      method: 'GET',
      url: '/api/staff/location',
      query: {
        limit: '2',
        page: '2'
      },
      headers: { Authorization: `Bearer ${accessTokens[Role.LIBRARIAN]}` }
    });

    expect(page2Response.statusCode).toBe(200);
    const page2Body = page2Response.json();
    expect(page2Body.data).toHaveLength(2);

    // Ensure different pages return different results
    const page1Ids = page1Body.data.map((l: { location_id: string }) => l.location_id);
    const page2Ids = page2Body.data.map((l: { location_id: string }) => l.location_id);
    expect(page1Ids).not.toEqual(page2Ids);
  });

  it.each([{ role: Role.ADMIN }, { role: Role.LIBRARIAN }])(
    'should allow $role to list locations',
    async ({ role }) => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/staff/location',
        headers: { Authorization: `Bearer ${accessTokens[role]}` }
      });

      expect(response.statusCode).toBe(200);
    }
  );
});
