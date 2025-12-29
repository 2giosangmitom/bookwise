import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

const createBookAndLocation = async (app: Awaited<ReturnType<typeof build>>) => {
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

  return { book, location };
};

const createLoanRecord = async (app: Awaited<ReturnType<typeof build>>, memberUserId: string) => {
  const { book, location } = await createBookAndLocation(app);
  const bookClone = await app.prisma.book_Clone.create({
    data: {
      book_id: book.book_id,
      location_id: location.location_id,
      barcode: faker.string.alphanumeric(10),
      condition: 'GOOD'
    }
  });

  const loan = await app.prisma.loan.create({
    data: {
      user_id: memberUserId,
      book_clone_id: bookClone.book_clone_id,
      loan_date: faker.date.past(),
      due_date: faker.date.soon()
    }
  });

  return { loan, bookClone };
};

describe('PATCH /api/staff/loan/:loan_id', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};
  let memberUserId: string;

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);
    accessTokens[Role.LIBRARIAN] = await getAccessToken(app, users[1]);
    accessTokens[Role.MEMBER] = await getAccessToken(app, users[4]);

    const member = await app.prisma.user.findUnique({ where: { email: users[4].email } });
    memberUserId = member?.user_id ?? faker.string.uuid();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthenticated requests', async () => {
    const { loan } = await createLoanRecord(app, memberUserId);

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/staff/loan/${loan.loan_id}`,
      payload: { status: 'RETURNED' }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject update request for MEMBER role', async () => {
    const { loan } = await createLoanRecord(app, memberUserId);

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/staff/loan/${loan.loan_id}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` },
      payload: { status: 'RETURNED' }
    });

    expect(response.statusCode).toBe(403);
  });

  it('should update loan status and return_date for ADMIN', async () => {
    const { loan } = await createLoanRecord(app, memberUserId);
    const returnDate = faker.date.recent().toISOString();
    const loanDate = faker.date.past().toISOString();

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/staff/loan/${loan.loan_id}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: { status: 'RETURNED', return_date: returnDate, loan_date: loanDate }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.status).toBe('RETURNED');
    expect(body.data.return_date.slice(0, 10)).toBe(returnDate.slice(0, 10));
    expect(body.data.loan_date.slice(0, 10)).toBe(loanDate.slice(0, 10));
  });

  it('should update due_date for LIBRARIAN', async () => {
    const { loan } = await createLoanRecord(app, memberUserId);
    const dueDate = faker.date.soon().toISOString();

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/staff/loan/${loan.loan_id}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.LIBRARIAN]}` },
      payload: { due_date: dueDate }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.due_date.slice(0, 10)).toBe(dueDate.slice(0, 10));
  });

  it('should return 404 for non-existent loan', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/staff/loan/${faker.string.uuid()}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: { status: 'OVERDUE' }
    });

    expect(response.statusCode).toBe(404);
  });

  it('should return 400 when no update fields provided', async () => {
    const { loan } = await createLoanRecord(app, memberUserId);

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/staff/loan/${loan.loan_id}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: {}
    });

    expect(response.statusCode).toBe(400);
  });
});
