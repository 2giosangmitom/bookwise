import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('PUT /api/staff/category/:category_id', async () => {
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

  it('should reject unauthorized access', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/staff/category/${faker.string.uuid()}`,
      payload: {
        name: faker.lorem.word(),
        slug: faker.lorem.slug()
      }
    });

    expect(res.statusCode).toBe(401);
  });

  it('should reject access for non-staff users', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/staff/category/${faker.string.uuid()}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.MEMBER]}`
      },
      payload: {
        name: faker.lorem.word(),
        slug: faker.lorem.slug()
      }
    });

    expect(res.statusCode).toBe(403);
  });

  it.each([{ role: Role.ADMIN }, { role: Role.LIBRARIAN }])(
    'should update category for $role role',
    async ({ role }) => {
      // First, create a category to update
      const createRes = await app.inject({
        method: 'POST',
        url: '/api/staff/category',
        headers: {
          Authorization: `Bearer ${accessTokens[role]}`
        },
        payload: {
          name: faker.lorem.word(),
          slug: faker.lorem.slug()
        }
      });

      expect(createRes.statusCode).toBe(201);
      const createdCategory = createRes.json().data;

      // Now, update the created category
      const updatedName = faker.lorem.word();
      const updatedSlug = faker.lorem.slug();

      const updateRes = await app.inject({
        method: 'PUT',
        url: `/api/staff/category/${createdCategory.category_id}`,
        headers: {
          Authorization: `Bearer ${accessTokens[role]}`
        },
        payload: {
          name: updatedName,
          slug: updatedSlug
        }
      });

      expect(updateRes.statusCode).toBe(200);
      const updatedCategory = updateRes.json().data;

      expect(updatedCategory).toEqual(
        expect.objectContaining({
          category_id: createdCategory.category_id,
          name: updatedName,
          slug: updatedSlug,
          created_at: expect.any(String),
          updated_at: expect.any(String)
        })
      );
    }
  );

  it('should return 404 when updating a non-existent category', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/staff/category/${faker.string.uuid()}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: {
        name: faker.lorem.word(),
        slug: faker.lorem.slug()
      }
    });

    expect(res.statusCode).toBe(404);
  });

  it('should return 409 when updating a category with a duplicate slug', async () => {
    // First, create two categories
    const createRes1 = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: {
        name: faker.lorem.word(),
        slug: faker.lorem.slug()
      }
    });

    expect(createRes1.statusCode).toBe(201);
    const category1 = createRes1.json().data;

    const createRes2 = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: {
        name: faker.lorem.word(),
        slug: faker.lorem.slug()
      }
    });

    expect(createRes2.statusCode).toBe(201);
    const category2 = createRes2.json().data;

    // Now, attempt to update category2 with the slug of category1
    const updateRes = await app.inject({
      method: 'PUT',
      url: `/api/staff/category/${category2.category_id}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: {
        name: faker.lorem.word(),
        slug: category1.slug
      }
    });

    expect(updateRes.statusCode).toBe(409);
  });
});
