# API Coding Instructions

This document provides strict, long-term AI coding instructions for the Fastify API in the BookWise monorepo.

## Purpose & Scope

This is a REST API service for the BookWise library management system. It handles authentication, user management, book catalog, loans, and administrative operations.

## Tech Stack

- **Runtime**: Node.js 24+ with ESM modules
- **Framework**: Fastify 5.x with TypeBox type provider
- **Database**: PostgreSQL via Prisma ORM 7.x
- **Cache**: Redis via @fastify/redis
- **Validation**: TypeBox schemas with JSON Schema compilation
- **Auth**: JWT with @fastify/jwt and @fastify/auth
- **DI Container**: Awilix via @fastify/awilix
- **Testing**: Vitest with separate unit and integration projects

## Architecture & Folder Conventions

```
src/
├── app.ts              # Fastify app builder with autoload
├── server.ts           # Server bootstrap and graceful shutdown
├── constants.ts        # Application-wide constants
├── config/             # Environment configuration
│   ├── configService.ts
│   └── envSchema.ts
├── generated/          # Prisma generated client (DO NOT EDIT)
│   └── prisma/
├── hooks/              # Reusable Fastify hooks
│   ├── auth.ts         # Authentication hooks (authHook, isAdminHook, etc.)
│   └── onRoute.ts      # Route metadata hooks
├── modules/            # Feature modules (autoloaded)
│   ├── auth/           # Public authentication routes
│   ├── user/           # User-facing routes
│   ├── admin/          # Admin-only routes (nested modules)
│   └── staff/          # Staff routes (ADMIN or LIBRARIAN)
│       ├── autohooks.ts
│       ├── book/
│       ├── book_clone/
│       ├── category/
│       └── ...
├── plugins/            # Fastify plugins (autoloaded, encapsulate: false)
│   ├── awilix.ts
│   ├── auth.ts
│   ├── cookie.ts
│   ├── cors.ts
│   ├── jwt.ts
│   ├── prisma.ts
│   ├── redis.ts
│   ├── sensible.ts
│   └── swagger.ts
└── utils/              # Utility functions
    ├── hash.ts
    └── jwt.ts
types/
└── global.d.ts         # Global TypeScript types
tests/
├── integration/        # Integration tests with real database
│   ├── helpers/
│   └── setup/
└── unit/               # Unit tests with mocks
    └── helpers/
```

## Module Structure

Each feature module MUST follow this structure:

```
modules/<feature>/
├── autohooks.ts    # DI registration + route tags
├── routes.ts       # Route definitions (index file for autoload)
├── schemas.ts      # TypeBox request/response schemas
├── controllers.ts  # Request handlers (thin, delegate to services)
└── services.ts     # Business logic and database operations
```

For nested modules (e.g., `staff/book_clone/`), the parent module contains shared autohooks (e.g., `staff/autohooks.ts` for role checking).

## Fastify-Specific Rules

### Schemas

1. ALWAYS define schemas for every route using TypeBox
2. Schemas MUST satisfy `FastifySchema` type:

   ```typescript
   import { Type } from 'typebox';
   import { type FastifySchema } from 'fastify';

   export const CreateBookSchema = {
     summary: 'Create a new book',
     description: 'Detailed description here.',
     body: Type.Object({
       title: Type.String(),
       isbn: Type.String()
     }),
     security: [{ JWT: [] }],
     response: {
       201: Type.Object({
         message: Type.String(),
         data: Type.Object({ book_id: Type.String({ format: 'uuid' }) })
       }),
       409: { $ref: 'HttpError' },
       500: { $ref: 'HttpError' }
     }
   } as const satisfies FastifySchema;
   ```

3. Use `{ $ref: 'HttpError' }` for error responses (provided by @fastify/sensible)
4. Include `security: [{ JWT: [] }]` for authenticated routes
5. Use Prisma enums via import: `import { BookCondition } from '@/generated/prisma/enums'`

### Routes

1. Routes file MUST export a default function:

   ```typescript
   export default function bookRoutes(fastify: FastifyTypeBox) {
     const controller = fastify.diContainer.resolve<BookController>('bookController');

     fastify.get('/', { schema: GetBooksSchema }, controller.getBooks.bind(controller));
     fastify.post('/', { schema: CreateBookSchema }, controller.createBook.bind(controller));
   }
   ```

2. ALWAYS bind controller methods: `controller.method.bind(controller)`
3. NEVER write inline handlers in routes

### Autohooks

1. Register services and controllers in autohooks:

   ```typescript
   import { addRouteTags } from '@/hooks/onRoute';
   import { asClass } from 'awilix';

   export default function bookHooks(fastify: FastifyTypeBox) {
     fastify.addHook('onRoute', addRouteTags('Staff/Book'));

     fastify.diContainer.register({
       bookService: asClass(BookService).singleton(),
       bookController: asClass(BookController).singleton()
     });
   }
   ```

2. Use cascading hooks for shared auth (e.g., `staff/autohooks.ts` applies role checks to all staff routes)

### Controllers

1. Controllers receive injected dependencies via constructor:

   ```typescript
   export default class BookController {
     private bookService: BookService;

     public constructor({ bookService }: { bookService: BookService }) {
       this.bookService = bookService;
     }
   }
   ```

2. Use typed request/reply from schema:
   ```typescript
   public async createBook(
     req: FastifyRequestTypeBox<typeof CreateBookSchema>,
     reply: FastifyReplyTypeBox<typeof CreateBookSchema>
   ) {
     const result = await this.bookService.createBook(req.body);
     return reply.code(201).send({ message: 'Created', data: result });
   }
   ```
3. NEVER access database directly in controllers
4. Convert Date objects to ISO strings: `created_at: result.created_at.toISOString()`

### Services

1. Services receive Prisma client via constructor:

   ```typescript
   export default class BookService {
     private prisma: PrismaClient;

     public constructor({ prisma }: { prisma: PrismaClient }) {
       this.prisma = prisma;
     }
   }
   ```

2. Handle Prisma errors and throw HTTP errors:

   ```typescript
   import { httpErrors } from '@fastify/sensible';

   try {
     return await this.prisma.book.create({ data });
   } catch (error) {
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
       if (error.code === 'P2002') throw httpErrors.conflict('Already exists');
       if (error.code === 'P2025') throw httpErrors.notFound('Not found');
       if (error.code === 'P2003') throw httpErrors.badRequest('Invalid reference');
     }
     throw error;
   }
   ```

3. NEVER throw raw Error objects; use `httpErrors.*` methods

### Authentication Hooks

Use hooks from `@/hooks/auth.ts`:

```typescript
import { authHook, isAdminHook, isAdminOrLibrarianHook } from '@/hooks/auth';

// In autohooks.ts for protected modules:
fastify.addHook('preHandler', isAdminOrLibrarianHook(fastify));
```

## Coding Rules

### TypeScript

1. Use strict TypeScript with no implicit any
2. Import types with `import type` when possible
3. Use path aliases: `@/` maps to `src/`
4. Global types are in `types/global.d.ts`:
   - `FastifyTypeBox` - Typed Fastify instance
   - `FastifyRequestTypeBox<TSchema>` - Typed request
   - `FastifyReplyTypeBox<TSchema>` - Typed reply
   - `AccessToken`, `RefreshToken` - JWT payload types

### Validation & Serialization

1. All input validation happens via TypeBox schemas
2. Response serialization happens via TypeBox schemas
3. NEVER manually validate request body/params/query
4. Use TypeBox constraints: `Type.String({ format: 'email' })`, `Type.Number({ minimum: 1 })`

### Error Handling

1. Use `httpErrors` from `@fastify/sensible`:
   - `httpErrors.notFound('Message')`
   - `httpErrors.conflict('Message')`
   - `httpErrors.badRequest('Message')`
   - `httpErrors.unauthorized('Message')`
   - `httpErrors.forbidden('Message')`
2. Errors propagate automatically to Fastify error handler
3. NEVER use try-catch to swallow errors silently

### Database

1. ALL database operations MUST be in service classes
2. Use Prisma's typed queries with select/omit for efficiency
3. For pagination:
   ```typescript
   const [items, total] = await Promise.all([
     this.prisma.book.findMany({ skip: (page - 1) * limit, take: limit }),
     this.prisma.book.count({ where: filters })
   ]);
   ```

## Testing

### Integration Tests

1. Use the `build()` helper to create app instance
2. Use `getAccessToken(app, user)` for authentication
3. Clean up created resources in `afterAll`
4. Test file location: `tests/integration/<module>/<action>.test.ts`

### Unit Tests

1. Mock Prisma client and other dependencies
2. Test service methods in isolation
3. Test file location: `tests/unit/modules/<module>/services.test.ts`

## Forbidden Actions

1. ❌ Writing business logic in routes.ts or controllers.ts
2. ❌ Accessing Prisma client outside service classes
3. ❌ Skipping schema validation for any route
4. ❌ Throwing raw Error objects instead of httpErrors
5. ❌ Using inline route handlers instead of controllers
6. ❌ Editing files in `src/generated/` directory
7. ❌ Hardcoding configuration values (use constants.ts or env)
8. ❌ Using `any` type without explicit justification
9. ❌ Creating routes without corresponding schemas
10. ❌ Registering DI outside of autohooks.ts files

## Example: Complete Module

### schemas.ts

```typescript
import { Type } from 'typebox';
import { type FastifySchema } from 'fastify';

export const GetBooksSchema = {
  summary: 'Get all books',
  description: 'Retrieve paginated list of books.',
  security: [{ JWT: [] }],
  querystring: Type.Object({
    page: Type.Optional(Type.Number({ minimum: 1 })),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
    searchTerm: Type.Optional(Type.String())
  }),
  response: {
    200: Type.Object({
      message: Type.String(),
      meta: Type.Object({ total: Type.Number() }),
      data: Type.Array(
        Type.Object({
          book_id: Type.String({ format: 'uuid' }),
          title: Type.String()
        })
      )
    }),
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
```

### services.ts

```typescript
import type { PrismaClient } from '@/generated/prisma/client';
import { Prisma } from '@/generated/prisma/client';
import { httpErrors } from '@fastify/sensible';

export default class BookService {
  private prisma: PrismaClient;

  public constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  public async getBooks(query: { page: number; limit: number; searchTerm?: string }) {
    const where: Prisma.BookWhereInput = query.searchTerm
      ? { title: { contains: query.searchTerm, mode: 'insensitive' } }
      : {};

    const [books, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.prisma.book.count({ where })
    ]);

    return { books, total };
  }
}
```

### controllers.ts

```typescript
import { GetBooksSchema } from './schemas';
import type BookService from './services';

export default class BookController {
  private bookService: BookService;

  public constructor({ bookService }: { bookService: BookService }) {
    this.bookService = bookService;
  }

  public async getBooks(
    req: FastifyRequestTypeBox<typeof GetBooksSchema>,
    reply: FastifyReplyTypeBox<typeof GetBooksSchema>
  ) {
    const { books, total } = await this.bookService.getBooks({
      page: req.query.page ?? 1,
      limit: req.query.limit ?? 10,
      searchTerm: req.query.searchTerm
    });

    return reply.status(200).send({
      message: 'Books retrieved successfully',
      meta: { total },
      data: books.map((b) => ({ book_id: b.book_id, title: b.title }))
    });
  }
}
```

### routes.ts

```typescript
import BookController from './controllers';
import { GetBooksSchema } from './schemas';

export default function bookRoutes(fastify: FastifyTypeBox) {
  const bookController = fastify.diContainer.resolve<BookController>('bookController');

  fastify.get('/', { schema: GetBooksSchema }, bookController.getBooks.bind(bookController));
}
```

### autohooks.ts

```typescript
import { addRouteTags } from '@/hooks/onRoute';
import { asClass } from 'awilix';
import BookService from './services';
import BookController from './controllers';

export default function bookHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Staff/Book'));

  fastify.diContainer.register({
    bookService: asClass(BookService).singleton(),
    bookController: asClass(BookController).singleton()
  });
}
```
