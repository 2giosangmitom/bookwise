---
applyTo: 'apps/api/**/*.ts'
---

# BookWise API Architecture Guide

## Overview

The BookWise API is a REST API built with **Fastify**, **TypeScript**, and **Prisma ORM**. It follows a modular architecture with strict separation of concerns using the **Singleton pattern** for controllers and services.

## Core Technology Stack

- **Runtime**: Node.js 24+ (ES Modules)
- **Framework**: Fastify 5.x with TypeBox type provider
- **Type Safety**: TypeScript 5.x with strict mode
- **Validation**: TypeBox schemas (compile-time and runtime validation)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (@fastify/jwt) with access/refresh tokens
- **Caching**: Redis (@fastify/redis)
- **DI Container**: Awilix (@fastify/awilix)
- **Testing**: Vitest with unit and integration test separation
- **Build**: esbuild for fast bundling

## Project Structure

```
apps/api/
├── src/
│   ├── app.ts                    # Application factory
│   ├── server.ts                 # Server entry point
│   ├── constants.ts              # Application constants
│   ├── config/
│   │   ├── configService.ts      # Environment configuration service
│   │   └── envSchema.ts          # TypeBox environment schema
│   ├── plugins/                  # Fastify plugins (wrapped with fastify-plugin)
│   │   ├── awilix.ts             # Dependency injection container
│   │   ├── auth.ts               # @fastify/auth integration
│   │   ├── cookie.ts             # Cookie handling
│   │   ├── cors.ts               # CORS configuration
│   │   ├── jwt.ts                # JWT authentication
│   │   ├── prisma.ts             # Prisma client
│   │   ├── redis.ts              # Redis client
│   │   ├── sensible.ts           # HTTP errors & utilities
│   │   └── swagger.ts            # OpenAPI documentation
│   ├── hooks/                    # Reusable Fastify hooks
│   │   ├── auth.ts               # Authentication & authorization hooks
│   │   └── onRoute.ts            # Route modification hooks
│   ├── modules/                  # Feature modules (autoloaded)
│   │   ├── auth/                 # Authentication (login, register, refresh)
│   │   ├── user/                 # User profile & management
│   │   ├── author/               # Public author endpoints
│   │   ├── book/                 # Public book endpoints
│   │   ├── category/             # Public category endpoints
│   │   ├── publisher/            # Public publisher endpoints
│   │   ├── rating/               # Book ratings
│   │   ├── admin/                # Admin-only endpoints
│   │   └── staff/                # Staff endpoints (nested modules)
│   │       ├── autohooks.ts      # Staff-level auth hooks
│   │       ├── author/           # CRUD for authors
│   │       ├── book/             # CRUD for books
│   │       ├── book_clone/       # Physical book copies management
│   │       ├── category/         # CRUD for categories
│   │       ├── loan/             # Loan management
│   │       ├── location/         # Library location management
│   │       └── publisher/        # CRUD for publishers
│   ├── utils/                    # Utility functions
│   │   ├── hash.ts               # Password hashing (bcrypt)
│   │   └── jwt.ts                # JWT helper functions
│   └── generated/                # Auto-generated files (Prisma)
│       └── prisma/
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration history
├── tests/
│   ├── unit/                     # Unit tests
│   │   ├── helpers/              # Test utilities
│   │   ├── hooks/                # Hook tests
│   │   ├── modules/              # Module tests
│   │   └── utils/                # Utility tests
│   └── integration/              # Integration tests
│       ├── setup/
│       │   └── globalSetup.ts
│       └── helpers/
│           ├── build.ts          # Test app builder
│           └── auth.ts           # Auth test helpers
├── types/
│   └── global.d.ts               # Global type declarations
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── eslint.config.mjs
```

## Architecture Patterns

### 1. Module Structure (Feature-Based Organization)

Each module follows a strict file structure:

```
module-name/
├── routes.ts         # Route definitions (entry point for @fastify/autoload)
├── controllers.ts    # Request/response handling (Singleton class)
├── services.ts       # Business logic (Singleton class)
├── schemas.ts        # TypeBox schemas for validation & documentation
└── autohooks.ts      # Module-specific hooks (optional)
```

### 2. Dependency Injection with Awilix

**Controllers and services use Awilix for dependency injection:**

```typescript
// services.ts
import type { PrismaClient } from '@/generated/prisma/client';
import { httpErrors } from '@fastify/sensible';

export default class AuthService {
  private prisma: PrismaClient;

  public constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  public async getAuthorBySlug(slug: string) {
    const author = await this.prisma.author.findUnique({
      where: { slug }
    });

    if (!author) {
      throw httpErrors.notFound('Author not found');
    }

    return author;
  }
}
```

```typescript
// controllers.ts
import type AuthService from './services';
import type { PrismaClient } from '@/generated/prisma/client';

export default class AuthController {
  private authService: AuthService;
  private prisma: PrismaClient;

  public constructor({ authService, prisma }: { authService: AuthService; prisma: PrismaClient }) {
    this.authService = authService;
    this.prisma = prisma;
  }

  public async getAuthorBySlug(
    req: FastifyRequestTypeBox<typeof GetAuthorBySlugSchema>,
    reply: FastifyReplyTypeBox<typeof GetAuthorBySlugSchema>
  ) {
    const { slug } = req.params;
    const author = await this.authService.getAuthorBySlug(slug);

    return reply.status(200).send({
      message: 'Author retrieved successfully',
      data: {
        ...author,
        date_of_birth: author.date_of_birth?.toISOString() || null,
        created_at: author.created_at.toISOString(),
        updated_at: author.updated_at.toISOString()
      }
    });
  }
}
```

**Registering in autohooks.ts:**

```typescript
import { diContainer } from '@fastify/awilix';
import { asClass } from 'awilix';
import AuthService from './services';
import AuthController from './controllers';
import { addRouteTags } from '@/hooks/onRoute';

export default function authHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Auth'));

  diContainer.register({
    authService: asClass(AuthService).singleton(),
    authController: asClass(AuthController).singleton()
  });
}
```

**Key Rules:**

- Controllers and services use **constructor injection** with destructured parameters
- Dependencies are declared as `type` imports to avoid circular dependencies
- Register classes in `autohooks.ts` using `asClass().singleton()`
- Use `httpErrors` from `@fastify/sensible` directly (not `this.fastify.httpErrors`)
- Services receive only what they need (e.g., `prisma`, `jwtUtils`, custom utilities)
- Controllers receive services and any direct dependencies they need
- Controllers handle HTTP concerns; services contain business logic

### 3. Routes Definition

Routes are the entry point for each module (detected by `@fastify/autoload`):

```typescript
// routes.ts
import AuthController from './controllers';
import { SignUpSchema, SignInSchema } from './schemas';

export default function authRoutes(fastify: FastifyTypeBox) {
  const authController = fastify.diContainer.resolve<AuthController>('authController');

  fastify.post('/signup', { schema: SignUpSchema }, authController.signUp.bind(authController));
  fastify.post('/signin', { schema: SignInSchema }, authController.signIn.bind(authController));
}
```

**Rules:**

- Export a default function that accepts `fastify: FastifyTypeBox`
- File must be named `routes.ts` (or `routes.js`)
- Resolve controllers from DI container: `fastify.diContainer.resolve<ControllerType>('controllerName')`
- Methods must be bound to maintain `this` context: `.bind(controller)`
- All routes automatically get `/api` prefix (configured in [app.ts](apps/api/src/app.ts))

### 4. Schema Definitions

Use TypeBox for type-safe validation and OpenAPI documentation:

```typescript
// schemas.ts
import { type FastifySchema } from 'fastify';
import Type from 'typebox';

export const GetAuthorBySlugSchema = {
  summary: 'Get author by slug',
  description: 'Retrieve a single author by their unique slug.',
  params: Type.Object({
    slug: Type.String()
  }),
  response: {
    200: Type.Object({
      message: Type.String(),
      data: Type.Object({
        author_id: Type.String({ format: 'uuid' }),
        name: Type.String(),
        biography: Type.String(),
        slug: Type.String(),
        created_at: Type.String({ format: 'date-time' }),
        updated_at: Type.String({ format: 'date-time' })
      })
    }),
    404: { $ref: 'HttpError' },
    500: { $ref: 'HttpError' }
  }
} as const satisfies FastifySchema;
```

**Rules:**

- Use `Type` from `typebox` (not `@sinclair/typebox`)
- Mark schemas as `const` and satisfy `FastifySchema`
- Reference shared error schemas using `$ref: 'HttpError'`
- Include `summary` and `description` for Swagger docs
- All response keys must be status codes (200, 400, 404, etc.)

### 5. Auto Hooks (Module-Level Middleware & DI Registration)

Use `autohooks.ts` for module-scoped hooks and dependency injection registration:

```typescript
// modules/auth/autohooks.ts
import { addRouteTags } from '@/hooks/onRoute';
import { diContainer } from '@fastify/awilix';
import { asClass } from 'awilix';
import AuthService from './services';
import AuthController from './controllers';

export default function authHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Auth'));

  // Register module dependencies
  diContainer.register({
    authService: asClass(AuthService).singleton(),
    authController: asClass(AuthController).singleton()
  });
}
```

```typescript
// modules/staff/autohooks.ts
import { isAdminOrLibrarianHook } from '@/hooks/auth';
import { addRouteTags } from '@/hooks/onRoute';

export default function staffHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', addRouteTags('Staff'));
  fastify.addHook('preHandler', isAdminOrLibrarianHook(fastify));
}
```

**Rules:**

- Export a default function accepting `fastify: FastifyTypeBox`
- File must be named `autohooks.ts` (detected by autoload config)
- Hooks apply to all routes in the module and its sub-modules
- Register module services/controllers using `diContainer.register()`
- Use `asClass().singleton()` for classes, `asValue()` for instances
- Use for authentication, Swagger tags, logging, and DI setup

### 6. Registering Global Dependencies

Global dependencies (like `prisma`, `jwtUtils`) are registered in plugins:

```typescript
// plugins/prisma.ts
import { diContainer } from '@fastify/awilix';
import { asValue } from 'awilix';

export default fp(async (fastify) => {
  const prisma = new PrismaClient();

  diContainer.register({
    prisma: asValue(prisma)
  });

  fastify.decorate('prisma', prisma);
});
```

```typescript
// plugins/jwt.ts
import { diContainer } from '@fastify/awilix';
import { asValue } from 'awilix';
import { JWTUtils } from '@/utils/jwt';

export default fp(async (fastify) => {
  const jwtUtils = JWTUtils.getInstance(fastify.redis);

  diContainer.register({
    jwtUtils: asValue(jwtUtils)
  });

  // ... register @fastify/jwt
});
```

**Available Global Dependencies:**

- `prisma` - Prisma Client instance
- `jwtUtils` - JWT utility class (for token storage/validation)

### 7. Authentication & Authorization

Use predefined hooks from `src/hooks/auth.ts`:

```typescript
import { authHook, isLibrarianHook, isAdminHook, isAdminOrLibrarianHook } from '@/hooks/auth';

// In routes or autohooks:
fastify.addHook('preHandler', fastify.auth([authHook])); // JWT verification
fastify.addHook('preHandler', isAdminOrLibrarianHook(fastify)); // Role check
```

**Available Hooks:**

- `authHook`: Verifies JWT token (populates `req.user`)
- `isLibrarianHook`: Requires LIBRARIAN role
- `isAdminHook`: Requires ADMIN role
- `isAdminOrLibrarianHook(app)`: Requires ADMIN OR LIBRARIAN role

**Access Token Structure:**

```typescript
type AccessToken = {
  user_id: string;
  role: 'ADMIN' | 'LIBRARIAN' | 'USER';
};
```

### 8. Error Handling

Use `httpErrors` from `@fastify/sensible` directly in services:

```typescript
// In services:
import { httpErrors } from '@fastify/sensible';

throw httpErrors.notFound('Resource not found');
throw httpErrors.badRequest('Invalid input');
throw httpErrors.unauthorized('Invalid credentials');
throw httpErrors.forbidden('Insufficient permissions');
throw httpErrors.conflict('Resource already exists');
```

**Never return error responses manually** - always throw HTTP errors.

### 9. Database Access (Prisma)

Access Prisma via the injected dependency in services:

```typescript
// In services:
import type { PrismaClient } from '@/generated/prisma/client';

export default class UserService {
  private prisma: PrismaClient;

  public constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  public async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId }
    });

    if (!user) {
      throw httpErrors.notFound('User not found');
    }

    return user;
  }

  public async getBooks() {
    return await this.prisma.book.findMany({
      include: { author: true, category: true }
    });
  }
}
```

**Rules:**

- All database operations go in services (never in controllers or routes)
- Inject `prisma` via constructor
- Use Prisma's type-safe query API
- Leverage `include` and `select` for relations
- Handle potential `null` results (e.g., `findUnique` can return null)

### 10. Nested Modules (Staff Example)

The `staff/` module demonstrates nested autoload with cascading hooks:

```
modules/staff/
├── autohooks.ts      # Applies auth to all staff routes (no DI registration needed here)
├── author/
│   ├── autohooks.ts  # Register author service/controller
│   ├── routes.ts
│   ├── controllers.ts
│   ├── services.ts
│   └── schemas.ts
├── book/
└── loan/
```

**Rules:**

- Parent `autohooks.ts` cascades hooks to all child modules
- Each child module registers its own services/controllers in its `autohooks.ts`
- Routes are automatically prefixed: `/api/staff/author`, `/api/staff/book`

## Application Bootstrap (app.ts)

The `app.ts` file is the application factory:

```typescript
import { fastify } from 'fastify';
import { fastifyAutoload } from '@fastify/autoload';
import { type TypeBoxTypeProvider, TypeBoxValidatorCompiler } from '@fastify/type-provider-typebox';
import ConfigService from './config/configService';

export async function buildApp() {
  const app = fastify({
    logger: { /* pino config */ }
  })
    .withTypeProvider<TypeBoxTypeProvider>()
    .setValidatorCompiler(TypeBoxValidatorCompiler);

  // Register environment config
  const configService = new ConfigService(app);
  await configService.registerPlugin();
  const config = configService.env;

  // Autoload plugins
  await app.register(fastifyAutoload, {
    dir: `${import.meta.dirname}/plugins`,
    options: config,
    encapsulate: false // Plugins decorate global instance
  });

  // Autoload modules
  await app.register(fastifyAutoload, {
    dir: `${import.meta.dirname}/modules`,
    encapsulate: true,              // Modules are encapsulated
    ignorePattern: /.*.(ts|js)/,    # Only load directories
    indexPattern: /routes.(ts|js)/, # Entry point
    autoHooks: true,                # Enable autohooks
    autoHooksPattern: /autohooks.(ts|js)/,
    cascadeHooks: true,             # Parent hooks apply to children
    options: { prefix: '/api' }
  });

  return app;
}
```

**Key Points:**

- Plugins are loaded first (not encapsulated)
- Modules are autoloaded with encapsulation
- All routes get `/api` prefix
- Hooks cascade from parent to child modules

## Global Types (types/global.d.ts)

Declare global types for use throughout the app:

```typescript
import { type FastifyInstance, type FastifyRequest, type FastifyReply } from 'fastify';
import { type TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

declare global {
  type FastifyTypeBox = FastifyInstance<TypeBoxTypeProvider>;
  type FastifyRequestTypeBox<T> = FastifyRequest<T, TypeBoxTypeProvider>;
  type FastifyReplyTypeBox<T> = FastifyReply<T, TypeBoxTypeProvider>;

  type AccessToken = {
    user_id: string;
    role: 'ADMIN' | 'LIBRARIAN' | 'USER';
  };

  type RefreshToken = {
    user_id: string;
  };
}
```

## Testing Strategy

### Unit Tests

- Located in `tests/unit/`
- Test individual services, controllers, utilities in isolation
- Use mock Fastify instances
- Run with: `pnpm test:unit`

### Integration Tests

- Located in `tests/integration/`
- Test full HTTP request/response cycle
- Use real test database
- Global setup in `tests/integration/setup/globalSetup.ts`
- Run with: `pnpm test:integration`

## Development Commands

```bash
# Development server
pnpm dev

# Type checking
pnpm typecheck

# Run unit tests
pnpm test:unit

# Run integration tests
pnpm test:integration

# Test coverage
pnpm test:coverage

# Prisma commands
pnpm prisma:generate   # Generate Prisma Client
pnpm prisma:migrate    # Run migrations
pnpm prisma:studio     # Open Prisma Studio

# Linting
pnpm lint
```

## Best Practices

1. **Use Awilix for dependency injection** - controllers and services with constructor injection
2. **Register dependencies in autohooks** - use `diContainer.register()` with `asClass().singleton()`
3. **Use type imports** for dependencies to avoid circular references
4. **Bind controller methods** when passing to routes
5. **Use TypeBox schemas** for validation and docs (never plain objects)
6. **Throw httpErrors directly** from `@fastify/sensible` (not via `this.fastify`)
7. **Keep services database-focused**, controllers HTTP-focused
8. **Inject only what you need** - don't inject entire Fastify instance
9. **Leverage TypeScript strict mode** - no `any` types
10. **Write tests** for new features (unit + integration)
11. **Follow module structure** consistently across all features
12. **Use path aliases** (`@/` for `src/`) in imports

## Common Pitfalls

- **Don't** use Singleton pattern - use Awilix DI instead
- **Don't** inject entire `FastifyTypeBox` instance into services
- **Don't** use `this.fastify.httpErrors` - import `httpErrors` directly from `@fastify/sensible`
- **Don't** forget to bind controller methods in routes
- **Don't** forget to register services/controllers in `autohooks.ts`
- **Don't** put business logic in controllers
- **Don't** access database directly in controllers
- **Don't** return errors manually - always throw
- **Don't** use `satisfies` without `as const` in schemas
- **Don't** forget to handle null/undefined from Prisma queries
- **Don't** import services/controllers without `type` keyword (causes circular deps)

## Running Tests

```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# Coverage report
pnpm test:coverage
```

## Environment Variables

Required environment variables (defined in `envSchema.ts`):

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret
NODE_ENV=development|production|test
```

## API Response Format

**Success Response:**

```json
{
  "message": "Operation successful",
  "data": {
    /* response payload */
  }
}
```

**Error Response (from @fastify/sensible):**

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Resource not found"
}
```

## When Creating New Features

1. **Create module directory** in `src/modules/`
2. **Add required files**: `routes.ts`, `controllers.ts`, `services.ts`, `schemas.ts`, `autohooks.ts`
3. **Implement constructor injection** in controller and service with type imports
4. **Register in autohooks.ts** using `diContainer.register()` with `asClass().singleton()`
5. **Define TypeBox schemas** with OpenAPI metadata
6. **Resolve controller** in routes using `fastify.diContainer.resolve<ControllerType>('controllerName')`
7. **Write unit tests** in `tests/unit/modules/`
8. **Write integration tests** in `tests/integration/`
9. **Update Prisma schema** if database changes required
10. **Run migrations**: `pnpm prisma:migrate`

---

**Remember:** This architecture prioritizes type safety, modularity, and maintainability. Follow the patterns strictly for consistency across the codebase.
