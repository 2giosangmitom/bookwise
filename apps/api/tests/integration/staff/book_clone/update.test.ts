import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('PUT /api/staff/book_clone/:book_clone_id', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};
  let book_id: string;
  let location_id: string;

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);
    accessTokens[Role.LIBRARIAN] = await getAccessToken(app, users[1]);
    accessTokens[Role.MEMBER] = await getAccessToken(app, users[4]);

    // Create a book for testing
    const bookData = {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(2),
      isbn: faker.string.numeric(13),
      published_at: faker.date.past().toISOString(),
      publisher_id: null
    };

    const bookResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: bookData
    });

    book_id = bookResponse.json().data.book_id;

    // Create a location for testing
    const location = await app.prisma.location.create({
      data: {
        location_id: `LOC-${faker.string.alphanumeric(5).toUpperCase()}`,
        room: faker.helpers.arrayElement(['Main Hall', 'Study Room', 'Archive Room']),
        floor: faker.number.int({ min: 1, max: 5 }),
        shelf: faker.number.int({ min: 1, max: 20 }),
        row: faker.number.int({ min: 1, max: 10 })
      }
    });
    location_id = location.location_id;
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([
    { role: Role.ADMIN, initialCondition: 'NEW', updatedCondition: 'WORN' },
    { role: Role.LIBRARIAN, initialCondition: 'GOOD', updatedCondition: 'DAMAGED' }
  ])('should update a book clone for $role role', async ({ role, initialCondition, updatedCondition }) => {
    const bookCloneData = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: initialCondition
    };

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { Authorization: `Bearer ${accessTokens[role]}` },
      payload: bookCloneData
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json().data;

    const updatedData = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: updatedCondition
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/book_clone/${created.book_clone_id}`,
      headers: { Authorization: `Bearer ${accessTokens[role]}` },
      payload: updatedData
    });

    expect(updateResponse.statusCode).toBe(200);
    const body = updateResponse.json();
    expect(body.message).toBe('Book clone updated successfully');
    expect(body.data.book_clone_id).toBe(created.book_clone_id);
    expect(body.data.barcode).toBe(updatedData.barcode);
    expect(body.data.condition).toBe(updatedCondition);
  });

  it('should reject update for MEMBER role', async () => {
    const bookCloneData = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'NEW'
    };

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: bookCloneData
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json().data;

    const updatedData = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'GOOD'
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/book_clone/${created.book_clone_id}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` },
      payload: updatedData
    });

    expect(updateResponse.statusCode).toBe(403);
  });

  it('should return 404 when updating non-existing book clone', async () => {
    const randomId = faker.string.uuid();
    const updatedData = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'NEW'
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/book_clone/${randomId}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: updatedData
    });

    expect(updateResponse.statusCode).toBe(404);
    expect(updateResponse.json().message).toBe('Book clone with the given ID does not exist.');
  });

  it('should return 409 when updating with duplicate barcode', async () => {
    const duplicateBarcode = faker.string.alphanumeric(10);

    // Create first book clone
    const bookCloneData1 = {
      book_id,
      location_id,
      barcode: duplicateBarcode,
      condition: 'NEW'
    };

    const createResponse1 = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: bookCloneData1
    });

    expect(createResponse1.statusCode).toBe(201);

    // Create second book clone
    const bookCloneData2 = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'GOOD'
    };

    const createResponse2 = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: bookCloneData2
    });

    expect(createResponse2.statusCode).toBe(201);
    const created2 = createResponse2.json().data;

    // Try to update second book clone with duplicate barcode
    const updatedData = {
      book_id,
      location_id,
      barcode: duplicateBarcode,
      condition: 'WORN'
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/book_clone/${created2.book_clone_id}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: updatedData
    });

    expect(updateResponse.statusCode).toBe(409);
    expect(updateResponse.json().message).toBe('Book clone with the given barcode already exists.');
  });

  it('should return 400 when updating with invalid book_id', async () => {
    const bookCloneData = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'NEW'
    };

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: bookCloneData
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json().data;

    const updatedData = {
      book_id: faker.string.uuid(), // Invalid book_id
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'GOOD'
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/book_clone/${created.book_clone_id}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: updatedData
    });

    expect(updateResponse.statusCode).toBe(400);
    expect(updateResponse.json().message).toBe('Invalid book_id or location_id provided.');
  });

  it('should reject unauthenticated update requests', async () => {
    const bookCloneData = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'NEW'
    };

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: bookCloneData
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json().data;

    const updatedData = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'GOOD'
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/book_clone/${created.book_clone_id}`,
      payload: updatedData
    });

    expect(updateResponse.statusCode).toBe(401);
  });
});
