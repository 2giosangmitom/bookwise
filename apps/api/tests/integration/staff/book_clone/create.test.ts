import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('POST /api/staff/book_clone', async () => {
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

  it('should reject unauthenticated requests', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      payload: {
        book_id,
        location_id,
        barcode: faker.string.alphanumeric(10),
        condition: 'NEW'
      }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject create request for MEMBER role', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` },
      payload: {
        book_id,
        location_id,
        barcode: faker.string.alphanumeric(10),
        condition: 'NEW'
      }
    });

    expect(response.statusCode).toBe(403);
  });

  it.each([
    { role: Role.ADMIN, condition: 'GOOD' },
    { role: Role.LIBRARIAN, condition: 'NEW' }
  ])('should create book clone for $role role', async ({ role, condition }) => {
    const bookCloneData = {
      book_id,
      location_id,
      barcode: faker.string.alphanumeric(10),
      condition
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { Authorization: `Bearer ${accessTokens[role]}` },
      payload: bookCloneData
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.message).toBe('Book clone created successfully');
    expect(body.data.book_id).toBe(book_id);
    expect(body.data.location_id).toBe(location_id);
    expect(body.data.barcode).toBe(bookCloneData.barcode);
    expect(body.data.condition).toBe(condition);
  });

  it('should reject create book clone with duplicate barcode', async () => {
    const duplicateBarcode = faker.string.alphanumeric(10);

    const firstBookCloneData = {
      book_id,
      location_id,
      barcode: duplicateBarcode,
      condition: 'NEW'
    };

    const firstResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: firstBookCloneData
    });

    expect(firstResponse.statusCode).toBe(201);

    const secondBookCloneData = {
      book_id,
      location_id,
      barcode: duplicateBarcode,
      condition: 'GOOD'
    };

    const secondResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: secondBookCloneData
    });

    expect(secondResponse.statusCode).toBe(409);
    expect(secondResponse.json().message).toBe('Book clone with the given barcode already exists.');
  });

  it('should reject create book clone with invalid book_id', async () => {
    const invalidBookId = faker.string.uuid();

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: {
        book_id: invalidBookId,
        location_id,
        barcode: faker.string.alphanumeric(10),
        condition: 'NEW'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().message).toBe('Invalid book_id or location_id provided.');
  });

  it('should reject create book clone with invalid location_id', async () => {
    const invalidLocationId = 'INVALID-LOC';

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: {
        book_id,
        location_id: invalidLocationId,
        barcode: faker.string.alphanumeric(10),
        condition: 'NEW'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().message).toBe('Invalid book_id or location_id provided.');
  });

  it('should create book clone with different conditions', async () => {
    const conditions = ['WORN', 'DAMAGED', 'LOST'] as const;

    for (const condition of conditions) {
      const response = await app.inject({
        method: 'POST',
        url: '/api/staff/book_clone',
        headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
        payload: {
          book_id,
          location_id,
          barcode: faker.string.alphanumeric(10),
          condition
        }
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().data.condition).toBe(condition);
    }
  });
});
