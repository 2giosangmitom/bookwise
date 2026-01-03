import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('GET /api/staff/book_clone', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};
  let book_id: string;
  let bookTitle: string;
  let location_id: string;
  let testLoanUserId: string;
  let createdCloneIds: string[] = [];

  const createBookCloneForTest = async (
    overrides: Partial<{
      barcode: string;
      condition: string;
    }> = {}
  ) => {
    const payload = {
      book_id,
      location_id,
      barcode: overrides.barcode ?? faker.string.alphanumeric(12),
      condition: overrides.condition ?? 'NEW'
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/book_clone',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    createdCloneIds.push(body.data.book_clone_id);
    return body.data;
  };

  const createLoanForClone = async (book_clone_id: string, status: 'BORROWED' | 'RETURNED' | 'OVERDUE') => {
    await app.prisma.loan.create({
      data: {
        user_id: testLoanUserId,
        book_clone_id,
        loan_date: new Date(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status
      }
    });
  };

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);
    accessTokens[Role.LIBRARIAN] = await getAccessToken(app, users[1]);
    accessTokens[Role.MEMBER] = await getAccessToken(app, users[4]);

    const loanUser = await app.prisma.user.findUnique({ where: { email: users[4].email } });
    testLoanUserId = loanUser!.user_id;

    bookTitle = `TestBook-${faker.string.alphanumeric(6)}`;
    const bookData = {
      title: bookTitle,
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

  afterEach(async () => {
    if (createdCloneIds.length > 0) {
      await app.prisma.loan.deleteMany({ where: { book_clone_id: { in: createdCloneIds } } });
      await app.prisma.book_Clone.deleteMany({ where: { book_clone_id: { in: createdCloneIds } } });
      createdCloneIds = [];
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthenticated requests', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/book_clone'
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject member role', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/book_clone',
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` }
    });

    expect(response.statusCode).toBe(403);
  });

  it('should list book clones with pagination and availability filter', async () => {
    const marker = `bc-${faker.string.alphanumeric(6).toLowerCase()}`;

    const availableReturned = await createBookCloneForTest({
      barcode: `${marker}-returned`,
      condition: 'GOOD'
    });
    await createLoanForClone(availableReturned.book_clone_id, 'RETURNED');

    const borrowed = await createBookCloneForTest({
      barcode: `${marker}-borrowed`,
      condition: 'DAMAGED'
    });
    await createLoanForClone(borrowed.book_clone_id, 'BORROWED');

    const availableResponse = await app.inject({
      method: 'GET',
      url: '/api/staff/book_clone',
      query: {
        is_available: 'true',
        limit: '100',
        page: '1'
      },
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(availableResponse.statusCode).toBe(200);
    const availableBody = availableResponse.json();
    expect(availableBody.data.every((c: { is_available: boolean }) => c.is_available)).toBe(true);
    expect(availableBody.data.every((c: { book_title: string }) => typeof c.book_title === 'string')).toBe(true);

    const unavailableResponse = await app.inject({
      method: 'GET',
      url: '/api/staff/book_clone',
      query: {
        is_available: 'false'
      },
      headers: { Authorization: `Bearer ${accessTokens[Role.LIBRARIAN]}` }
    });

    expect(unavailableResponse.statusCode).toBe(200);
    const unavailableBody = unavailableResponse.json();
    expect(
      unavailableBody.data.some((c: { book_clone_id: string }) => c.book_clone_id === borrowed.book_clone_id)
    ).toBe(true);
    expect(unavailableBody.data.every((c: { is_available: boolean }) => c.is_available === false)).toBe(true);
  });

  it('should search book clones by barcode', async () => {
    const uniqueBarcode = `UNIQUE-${faker.string.alphanumeric(8).toUpperCase()}`;
    await createBookCloneForTest({ barcode: uniqueBarcode });

    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/book_clone',
      query: { searchTerm: uniqueBarcode },
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.some((c: { barcode: string }) => c.barcode === uniqueBarcode)).toBe(true);
  });

  it('should search book clones by location_id', async () => {
    await createBookCloneForTest({ barcode: faker.string.alphanumeric(12) });

    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/book_clone',
      query: { searchTerm: location_id },
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.every((c: { location_id: string }) => c.location_id.includes(location_id))).toBe(true);
  });

  it('should search book clones by book title', async () => {
    await createBookCloneForTest({ barcode: faker.string.alphanumeric(12) });

    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/book_clone',
      query: { searchTerm: bookTitle },
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.some((c: { book_title: string }) => c.book_title.includes(bookTitle))).toBe(true);
  });

  it('should filter book clones by condition', async () => {
    await createBookCloneForTest({ barcode: faker.string.alphanumeric(12), condition: 'DAMAGED' });

    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/book_clone',
      query: { condition: 'DAMAGED' },
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.every((c: { condition: string }) => c.condition === 'DAMAGED')).toBe(true);
  });
});
