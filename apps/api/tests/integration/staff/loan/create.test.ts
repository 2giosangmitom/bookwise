import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('POST /api/staff/loan', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};
  let book: Awaited<ReturnType<typeof app.prisma.book.create>>;
  let location: Awaited<ReturnType<typeof app.prisma.location.create>>;
  let memberUserId: string;

  const createBookClone = () =>
    app.prisma.book_Clone.create({
      data: {
        book_id: book.book_id,
        location_id: location.location_id,
        barcode: faker.string.alphanumeric(10),
        condition: 'GOOD'
      }
    });

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);
    accessTokens[Role.LIBRARIAN] = await getAccessToken(app, users[1]);
    accessTokens[Role.MEMBER] = await getAccessToken(app, users[4]);

    const member = await app.prisma.user.findUnique({ where: { email: users[4].email } });
    memberUserId = member?.user_id ?? faker.string.uuid();

    book = await app.prisma.book.create({
      data: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(2),
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null
      }
    });

    location = await app.prisma.location.create({
      data: {
        location_id: `LOC-${faker.string.alphanumeric(6)}`,
        room: 'A',
        floor: 1,
        shelf: 1,
        row: 1
      }
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthenticated requests', async () => {
    const bookClone = await createBookClone();
    const payload = {
      user_id: faker.string.uuid(),
      book_clone_id: bookClone.book_clone_id,
      loan_date: faker.date.past().toISOString(),
      due_date: faker.date.soon().toISOString()
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/loan',
      payload
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject create request for MEMBER role', async () => {
    const bookClone = await createBookClone();
    const payload = {
      user_id: faker.string.uuid(),
      book_clone_id: bookClone.book_clone_id,
      loan_date: faker.date.past().toISOString(),
      due_date: faker.date.soon().toISOString()
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/loan',
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` },
      payload
    });

    expect(response.statusCode).toBe(403);
  });

  it.each([{ role: Role.ADMIN }, { role: Role.LIBRARIAN }])('should create loan for $role role', async ({ role }) => {
    const bookClone = await createBookClone();
    const payload = {
      user_id: memberUserId,
      book_clone_id: bookClone.book_clone_id,
      loan_date: faker.date.past().toISOString(),
      due_date: faker.date.soon().toISOString()
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/loan',
      headers: { Authorization: `Bearer ${accessTokens[role]}` },
      payload
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('data');
    expect(body.data.loan_id).toBeDefined();
    expect(body.data.book_clone_id).toBe(bookClone.book_clone_id);
    expect(body.data.user_id).toBe(payload.user_id);
    expect(body.data.status).toBe('BORROWED');
  });

  it('should reject duplicate loan for the same book clone', async () => {
    const bookClone = await createBookClone();
    const payload = {
      user_id: memberUserId,
      book_clone_id: bookClone.book_clone_id,
      loan_date: faker.date.past().toISOString(),
      due_date: faker.date.soon().toISOString()
    };

    const firstResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/loan',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload
    });

    expect(firstResponse.statusCode).toBe(201);

    const secondResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/loan',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload
    });

    expect(secondResponse.statusCode).toBe(409);
  });
});
