import { build, users } from '../../helpers/build';
import { getAccessToken } from '../../helpers/auth';
import { Role } from '@/generated/prisma/enums';
import { faker } from '@faker-js/faker';

describe('PUT /api/staff/book/:book_id', async () => {
  const app = await build();
  let accessTokens: Record<Role, string>;

  beforeAll(async () => {
    accessTokens = {
      [Role.ADMIN]: await getAccessToken(app, users[0]),
      [Role.LIBRARIAN]: await getAccessToken(app, users[1]),
      [Role.MEMBER]: await getAccessToken(app, users[4])
    };
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([Role.ADMIN, Role.LIBRARIAN])('should allow %s to update a book', async (role) => {
    // First, create a book to update
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: {
        Authorization: `Bearer ${accessTokens[role]}`
      },
      payload: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(2),
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null
      }
    });

    expect(createResponse.statusCode).toBe(201);
    const createdBook = createResponse.json();

    // Now, update the book
    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/book/${createdBook.data.book_id}`,
      headers: {
        Authorization: `Bearer ${accessTokens[role]}`
      },
      payload: {
        title: 'Updated ' + createdBook.data.title,
        description: createdBook.data.description,
        isbn: createdBook.data.isbn,
        published_at: createdBook.data.published_at,
        publisher_id: createdBook.data.publisher_id
      }
    });

    expect(updateResponse.statusCode).toBe(200);
    const updatedBook = updateResponse.json();
    expect(updatedBook.data.title).toBe('Updated ' + createdBook.data.title);
  });

  it('should reject update request for MEMBER role', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/api/staff/book/${faker.string.uuid()}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.MEMBER]}` },
      payload: {
        title: 'Some Title',
        description: 'Some Description',
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null
      }
    });

    expect(response.statusCode).toBe(403);
  });

  it('should return 404 for non-existent book', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/api/staff/book/${faker.string.uuid()}`,
      headers: { Authorization: `Bearer ${accessTokens[Role.ADMIN]}` },
      payload: {
        title: 'Non-existent Book',
        description: 'This book does not exist',
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null
      }
    });

    expect(response.statusCode).toBe(404);
  });

  it('should return 409 for ISBN conflict', async () => {
    // Create first book
    const createResponse1 = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(2),
        isbn: '1234567890123',
        published_at: faker.date.past().toISOString(),
        publisher_id: null
      }
    });

    expect(createResponse1.statusCode).toBe(201);

    // Create second book
    const createResponse2 = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(2),
        isbn: '9876543210987',
        published_at: faker.date.past().toISOString(),
        publisher_id: null
      }
    });

    expect(createResponse2.statusCode).toBe(201);
    const book2 = createResponse2.json();

    // Attempt to update second book's ISBN to first book's ISBN
    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/book/${book2.data.book_id}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: {
        title: book2.data.title,
        description: book2.data.description,
        isbn: '1234567890123', // Conflicting ISBN
        published_at: book2.data.published_at,
        publisher_id: book2.data.publisher_id
      }
    });

    expect(updateResponse.statusCode).toBe(409);
  });

  it('should update authors of the book', async () => {
    // Create authors
    const author1 = await app.inject({
      method: 'POST',
      url: '/api/staff/author',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.LIBRARIAN]}`
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

    // Create second author
    const author2 = await app.inject({
      method: 'POST',
      url: '/api/staff/author',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.LIBRARIAN]}`
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

    // Create a book
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.LIBRARIAN]}`
      },
      payload: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(2),
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null,
        authors: [author1.json().data.author_id]
      }
    });

    expect(createResponse.statusCode).toBe(201);
    const createdBook = createResponse.json();

    // Update the book to add authors
    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/book/${createdBook.data.book_id}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.LIBRARIAN]}`
      },
      payload: {
        title: createdBook.data.title,
        description: createdBook.data.description,
        isbn: createdBook.data.isbn,
        published_at: createdBook.data.published_at,
        publisher_id: createdBook.data.publisher_id,
        authors: [author2.json().data.author_id]
      }
    });

    expect(updateResponse.statusCode).toBe(200);
    const updatedBook = updateResponse.json();
    expect(updatedBook.data.authors.length).toBe(1);
    expect(updatedBook.data.authors[0]).toBe(author2.json().data.author_id);
  });

  it('should update categories of the book', async () => {
    // Create categories
    const category1 = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: {
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
        slug: faker.lorem.slug()
      }
    });

    const category2 = await app.inject({
      method: 'POST',
      url: '/api/staff/category',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: {
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
        slug: faker.lorem.slug()
      }
    });

    // Create a book
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/staff/book',
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(2),
        isbn: faker.string.numeric(13),
        published_at: faker.date.past().toISOString(),
        publisher_id: null,
        categories: [category1.json().data.category_id]
      }
    });

    expect(createResponse.statusCode).toBe(201);
    const createdBook = createResponse.json();

    // Update the book to change categories
    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/staff/book/${createdBook.data.book_id}`,
      headers: {
        Authorization: `Bearer ${accessTokens[Role.ADMIN]}`
      },
      payload: {
        title: createdBook.data.title,
        description: createdBook.data.description,
        isbn: createdBook.data.isbn,
        published_at: createdBook.data.published_at,
        publisher_id: createdBook.data.publisher_id,
        categories: [category2.json().data.category_id]
      }
    });

    expect(updateResponse.statusCode).toBe(200);
    const updatedBook = updateResponse.json();
    expect(updatedBook.data.categories.length).toBe(1);
    expect(updatedBook.data.categories[0]).toBe(category2.json().data.category_id);
  });
});
