import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../helpers/build';
import { faker } from '@faker-js/faker';

describe('GET /api/publisher/:slug', async () => {
  const app = await build();
  const testSlug = faker.lorem.slug();

  beforeAll(async () => {
    // Create a test publisher with a unique slug
    await app.prisma.publisher.create({
      data: {
        name: 'Test Publisher',
        website: 'https://testpublisher.com',
        slug: testSlug
      }
    });
  });

  afterAll(async () => {
    await app.prisma.publisher.deleteMany({
      where: { slug: testSlug }
    });
    await app.close();
  });

  it('should retrieve publisher by slug', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/publisher/${testSlug}`
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('data');
    expect(body.data.slug).toBe(testSlug);
    expect(body.data.name).toBe('Test Publisher');
  });

  it('should return 404 for non-existing slug', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/publisher/nonexistent'
    });

    expect(response.statusCode).toBe(404);
  });

  it('should return correct response format', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/publisher/${testSlug}`
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    const publisher = body.data;

    expect(publisher).toHaveProperty('publisher_id');
    expect(publisher).toHaveProperty('name');
    expect(publisher).toHaveProperty('website');
    expect(publisher).toHaveProperty('slug');
    expect(publisher).toHaveProperty('image_url');
    expect(publisher).toHaveProperty('created_at');
    expect(publisher).toHaveProperty('updated_at');
  });
});
