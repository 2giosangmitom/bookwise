import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('POST /api/staff/author', async () => {
  const app = await build();
  const accessTokens: Partial<Record<Role, string>> = {};

  beforeAll(async () => {
    accessTokens[Role.ADMIN] = await getAccessToken(app, users[0]);
    accessTokens[Role.LIBRARIAN] = await getAccessToken(app, users[1]);
    accessTokens[Role.MEMBER] = await getAccessToken(app, users[4]);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject unauthenticated requests', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/author',
      payload: {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(3),
        date_of_birth: faker.date.past().toISOString(),
        date_of_death: null,
        nationality: faker.location.country(),
        slug: faker.lorem.slug()
      }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject create request for MEMBER role', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/author',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.MEMBER]}`
      },
      payload: {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(3),
        date_of_birth: faker.date.past().toISOString(),
        date_of_death: null,
        nationality: faker.location.country(),
        slug: faker.lorem.slug()
      }
    });

    expect(response.statusCode).toBe(403);
  });

  it.each([{ role: Role.ADMIN }, { role: Role.LIBRARIAN }])('should create author for $role role', async ({ role }) => {
    const authorData = {
      name: faker.person.fullName(),
      short_biography: faker.lorem.sentence(),
      biography: faker.lorem.paragraphs(3),
      date_of_birth: faker.date.past().toISOString(),
      date_of_death: null,
      nationality: faker.location.country(),
      slug: faker.lorem.slug()
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/staff/author',
      headers: {
        Authorization: `Bearer ${accessTokens[role]}`
      },
      payload: authorData
    });

    expect(response.statusCode).toBe(201);
  });

  it('should reject create author with duplicate slug', async () => {
    const duplicateSlug = faker.lorem.slug();

    // Create first author
    const firstAuthorData = {
      name: faker.person.fullName(),
      short_biography: faker.lorem.sentence(),
      biography: faker.lorem.paragraphs(3),
      date_of_birth: faker.date.past().toISOString(),
      date_of_death: null,
      nationality: faker.location.country(),
      slug: duplicateSlug
    };

    const firstResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/author',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: firstAuthorData
    });

    expect(firstResponse.statusCode).toBe(201);

    // Attempt to create second author with the same slug
    const secondAuthorData = {
      name: faker.person.fullName(),
      short_biography: faker.lorem.sentence(),
      biography: faker.lorem.paragraphs(3),
      date_of_birth: faker.date.past().toISOString(),
      date_of_death: null,
      nationality: faker.location.country(),
      slug: duplicateSlug
    };

    const secondResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/author',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: secondAuthorData
    });

    expect(secondResponse.statusCode).toBe(409);
  });
});
