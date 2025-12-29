import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('PUT /api/staff/author/:author_id', async () => {
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

  it('should reject unauthenticated update requests', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/api/staff/author/${faker.string.uuid()}`,
      payload: {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(4),
        date_of_birth: faker.date.past().toISOString(),
        date_of_death: null,
        nationality: faker.location.country(),
        slug: faker.lorem.slug()
      }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should reject update for MEMBER role', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/api/staff/author/${faker.string.uuid()}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.MEMBER]}`
      },
      payload: {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(4),
        date_of_birth: faker.date.past().toISOString(),
        date_of_death: null,
        nationality: faker.location.country(),
        slug: faker.lorem.slug()
      }
    });

    expect(response.statusCode).toBe(403);
  });

  it.each([{ role: Role.ADMIN }, { role: Role.LIBRARIAN }])(
    'should update an existing author for $role role',
    async ({ role }) => {
      const authorData = {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(3),
        date_of_birth: faker.date.past().toISOString(),
        date_of_death: null,
        nationality: faker.location.country(),
        slug: faker.lorem.slug()
      };

      // First, create an author to update later
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/staff/author',
        headers: {
          Authorization: `Bearer ${accessTokens[role]}`
        },
        payload: authorData
      });

      expect(createResponse.statusCode).toBe(201);
      const createdAuthor = createResponse.json().data;

      // Now, update the author
      const updatedAuthorData = {
        name: faker.person.fullName(),
        short_biography: faker.lorem.sentence(),
        biography: faker.lorem.paragraphs(4),
        date_of_birth: faker.date.past().toISOString(),
        date_of_death: null,
        nationality: faker.location.country(),
        slug: faker.lorem.slug()
      };

      const updateResponse = await app.inject({
        method: 'PUT',
        url: `/api/staff/author/${createdAuthor.author_id}`,
        headers: {
          Authorization: `Bearer ${accessTokens[role]}`
        },
        payload: updatedAuthorData
      });

      expect(updateResponse.statusCode).toBe(200);
      const updatedAuthor = updateResponse.json().data;

      expect(updatedAuthor).toEqual(
        expect.objectContaining({
          author_id: createdAuthor.author_id,
          ...updatedAuthorData,
          date_of_birth: updatedAuthorData.date_of_birth,
          date_of_death: updatedAuthorData.date_of_death
        })
      );
    }
  );

  it('should return 404 when trying to update a non-existing author', async () => {
    const nonExistingAuthorId = faker.string.uuid();

    const updatedAuthorData = {
      name: faker.person.fullName(),
      short_biography: faker.lorem.sentence(),
      biography: faker.lorem.paragraphs(4),
      date_of_birth: faker.date.past().toISOString(),
      date_of_death: null,
      nationality: faker.location.country(),
      slug: faker.lorem.slug()
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/author/${nonExistingAuthorId}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: updatedAuthorData
    });

    expect(updateResponse.statusCode).toBe(404);
  });
});
