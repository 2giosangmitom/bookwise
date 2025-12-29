import { build, users } from '../helpers/build';
import { faker } from '@faker-js/faker';

describe('GET /api/author/:slug', async () => {
  const app = await build();
  let admin_token: string;

  beforeAll(async () => {
    // Sign in as Admin
    const adminSignInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/signin',
      payload: {
        email: users[0].email,
        password: users[0].password
      }
    });
    admin_token = adminSignInResponse.json().data.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should retrieve an author by slug', async () => {
    const authorData = {
      name: faker.person.fullName(),
      short_biography: faker.lorem.sentence(),
      biography: faker.lorem.paragraphs(3),
      date_of_birth: faker.date.past().toISOString(),
      date_of_death: null,
      nationality: faker.location.country(),
      slug: faker.lorem.slug()
    };

    // First, create an author to retrieve later
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/author',
      headers: {
        authorization: `Bearer ${admin_token}`
      },
      payload: authorData
    });

    expect(createResponse.statusCode).toBe(201);
    const createdAuthor = JSON.parse(createResponse.body).data;

    // Now, retrieve the author by slug
    const getResponse = await app.inject({
      method: 'GET',
      url: `/api/author/${authorData.slug}`
    });

    expect(getResponse.statusCode).toBe(200);
    const retrievedAuthor = JSON.parse(getResponse.body).data;

    expect(retrievedAuthor).toEqual(
      expect.objectContaining({
        author_id: createdAuthor.author_id,
        name: authorData.name,
        short_biography: authorData.short_biography,
        biography: authorData.biography,
        date_of_birth: authorData.date_of_birth,
        date_of_death: authorData.date_of_death,
        nationality: authorData.nationality,
        slug: authorData.slug
      })
    );
  });

  it('should return 404 for non-existing slug', async () => {
    const nonExistingSlug = 'non-existing-slug-' + faker.string.uuid();

    const response = await app.inject({
      method: 'GET',
      url: `/api/author/${nonExistingSlug}`
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchInlineSnapshot(`
      {
        "error": "Not Found",
        "message": "Author with the given slug does not exist.",
        "statusCode": 404,
      }
    `);
  });
});
