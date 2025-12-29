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

describe('DELETE /api/staff/loan/:loan_id', async () => {
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
      method: 'DELETE',
      url: `/api/staff/loan/${loan.loan_id}`
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject delete request for MEMBER role', async () => {
    const { loan } = await createLoanRecord(app, memberUserId);

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/loan/${loan.loan_id}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` }
    });

    expect(response.statusCode).toBe(403);
  });

  it.each([{ role: Role.ADMIN }, { role: Role.LIBRARIAN }])('should delete loan for $role role', async ({ role }) => {
    const { loan } = await createLoanRecord(app, memberUserId);

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/loan/${loan.loan_id}`,
      headers: { Authorization: `Bearer ${accessTokens[role]}` }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.loan_id).toBe(loan.loan_id);
  });

  it('should return 404 for non-existent loan', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/staff/loan/${faker.string.uuid()}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` }
    });

    expect(response.statusCode).toBe(404);
  });
});
