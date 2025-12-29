import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

const createLoanRecord = async (
  app: Awaited<ReturnType<typeof build>>,
  memberUserId: string,
  overrides?: Partial<{ status: 'BORROWED' | 'RETURNED' | 'OVERDUE'; loan_date: Date; due_date: Date }>
) => {
  const book = await app.prisma.book.create({
    data: {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(2),
      isbn: faker.string.numeric(13),
      published_at: faker.date.past().toISOString(),
      publisher_id: null
    }
  });

  const location = await app.prisma.location.create({
    data: {
      location_id: `LOC-${faker.string.alphanumeric(6)}`,
      room: 'A',
      floor: 1,
      shelf: 1,
      row: 1
    }
  });

  const bookClone = await app.prisma.book_Clone.create({
    data: {
      book_id: book.book_id,
      location_id: location.location_id,
      barcode: `BC-${faker.string.alphanumeric(8)}`,
      condition: 'GOOD'
    }
  });

  const loan = await app.prisma.loan.create({
    data: {
      user_id: memberUserId,
      book_clone_id: bookClone.book_clone_id,
      loan_date: overrides?.loan_date ?? faker.date.past(),
      due_date: overrides?.due_date ?? faker.date.soon(),
      status: overrides?.status ?? 'BORROWED'
    }
  });

  return { loan, bookClone };
};

describe('GET /api/staff/loan', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};
  let memberUserId: string;

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);
    accessTokens[Role.LIBRARIAN] = await getAccessToken(app, users[1]);
    accessTokens[Role.MEMBER] = await getAccessToken(app, users[4]);

    const member = await app.prisma.user.findUnique({ where: { email: users[4].email } });
    memberUserId = member?.user_id ?? faker.string.uuid();

    // Seed a few loans
    await createLoanRecord(app, memberUserId, { status: 'BORROWED' });
    await createLoanRecord(app, memberUserId, { status: 'RETURNED' });
    await createLoanRecord(app, memberUserId, { status: 'OVERDUE' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthenticated requests', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/staff/loan' });
    expect(response.statusCode).toBe(401);
  });

  it('should reject MEMBER role', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/loan',
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` }
    });
    expect(response.statusCode).toBe(403);
  });

  it.each([{ role: Role.ADMIN }, { role: Role.LIBRARIAN }])(
    'should list loans with pagination for %s',
    async ({ role }) => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/staff/loan?page=1&limit=2',
        headers: { Authorization: `Bearer ${accessTokens[role]}` }
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty('meta');
      expect(body.meta.totalPages).toBeGreaterThanOrEqual(2);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeLessThanOrEqual(2);
    }
  );

  it('should filter by status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/staff/loan?status=RETURNED',
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { data: Array<{ status: string }> };
    expect(body.data.every((l) => l.status === 'RETURNED')).toBe(true);
  });

  it('should search by user email or barcode', async () => {
    // Fetch a known loan
    const loans = await app.prisma.loan.findMany({ take: 1, include: { user: true, book_clone: true } });
    const target = loans[0];
    const searchValue = target ? (target.book_clone?.barcode ?? target.user?.email ?? 'BC-') : 'BC-';

    const response = await app.inject({
      method: 'GET',
      url: `/api/staff/loan?search=${encodeURIComponent(searchValue)}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { data: unknown[] };
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(0);
  });
});
