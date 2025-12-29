import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('PUT /api/staff/publisher/:publisher_id', async () => {
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

  it.each([{ role: Role.ADMIN }, { role: Role.LIBRARIAN }])(
    'should update an existing publisher for $role role',
    async ({ role }) => {
      const publisherData = {
        name: faker.company.name(),
        website: 'https://example.com',
        slug: faker.lorem.slug()
      };

      // First, create a publisher to update later
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/staff/publisher',
        headers: {
          Authorization: `Bearer ${accessTokens[role]}`
        },
        payload: publisherData
      });

      expect(createResponse.statusCode).toBe(201);
      const createdPublisher = createResponse.json().data;

      // Now, update the publisher
      const updatedPublisherData = {
        name: faker.company.name(),
        website: 'https://newexample.com',
        slug: faker.lorem.slug()
      };

      const updateResponse = await app.inject({
        method: 'PUT',
        url: `/api/staff/publisher/${createdPublisher.publisher_id}`,
        headers: {
          Authorization: `Bearer ${accessTokens[role]}`
        },
        payload: updatedPublisherData
      });

      expect(updateResponse.statusCode).toBe(200);
      const updatedPublisher = updateResponse.json().data;

      expect(updatedPublisher).toEqual(
        expect.objectContaining({
          publisher_id: createdPublisher.publisher_id,
          name: updatedPublisherData.name,
          website: updatedPublisherData.website,
          slug: updatedPublisherData.slug
        })
      );
    }
  );

  it('should reject update for MEMBER role', async () => {
    const publisherData = {
      name: faker.company.name(),
      website: 'https://example.com',
      slug: faker.lorem.slug()
    };

    // First, create a publisher to update later
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: publisherData
    });

    expect(createResponse.statusCode).toBe(201);
    const createdPublisher = createResponse.json().data;

    // Try to update as member
    const updatedPublisherData = {
      name: faker.company.name(),
      website: 'https://newexample.com',
      slug: faker.lorem.slug()
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/publisher/${createdPublisher.publisher_id}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.MEMBER]}`
      },
      payload: updatedPublisherData
    });

    expect(updateResponse.statusCode).toBe(403);
  });

  it('should return 404 when trying to update a non-existing publisher', async () => {
    const nonExistingPublisherId = faker.string.uuid();

    const updatedPublisherData = {
      name: faker.company.name(),
      website: 'https://example.com',
      slug: faker.lorem.slug()
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/publisher/${nonExistingPublisherId}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: updatedPublisherData
    });

    expect(updateResponse.statusCode).toBe(404);
    const errorResponse = updateResponse.json();
    expect(errorResponse).toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: 'Publisher with the given ID does not exist.',
        error: 'Not Found'
      })
    );
  });

  it('should return 409 when updating with duplicate slug', async () => {
    const publisherData1 = {
      name: faker.company.name(),
      website: 'https://example1.com',
      slug: faker.lorem.slug()
    };

    const publisherData2 = {
      name: faker.company.name(),
      website: 'https://example2.com',
      slug: faker.lorem.slug()
    };

    // Create first publisher
    const createResponse1 = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: publisherData1
    });

    expect(createResponse1.statusCode).toBe(201);
    const publisher1 = createResponse1.json().data;

    // Create second publisher
    const createResponse2 = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: publisherData2
    });

    expect(createResponse2.statusCode).toBe(201);
    const publisher2 = createResponse2.json().data;

    // Try to update publisher2 with publisher1's slug
    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/publisher/${publisher2.publisher_id}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: {
        name: publisher2.name,
        website: publisher2.website,
        slug: publisher1.slug
      }
    });

    expect(updateResponse.statusCode).toBe(409);
    const errorResponse = updateResponse.json();
    expect(errorResponse.message).toBe('Publisher with the given slug already exists.');
  });

  it('should reject unauthenticated update requests', async () => {
    const publisherData = {
      name: faker.company.name(),
      website: 'https://example.com',
      slug: faker.lorem.slug()
    };

    // Create a publisher
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/publisher',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: publisherData
    });

    expect(createResponse.statusCode).toBe(201);
    const createdPublisher = createResponse.json().data;

    // Try to update without authentication
    const updatedPublisherData = {
      name: faker.company.name(),
      website: 'https://newexample.com',
      slug: faker.lorem.slug()
    };

    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/publisher/${createdPublisher.publisher_id}`,
      payload: updatedPublisherData
    });

    expect(updateResponse.statusCode).toBe(401);
  });
});
