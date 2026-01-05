# BookWise Development Guide for AI Agents

This guide provides essential information for AI coding agents working in the BookWise monorepo.

## Project Overview

BookWise is a university library management system built as a full-stack monorepo:

- **Backend**: Fastify API with TypeScript, Prisma ORM, PostgreSQL
- **Frontend**: Next.js 16 with App Router, React 19, Ant Design UI
- **Monorepo**: pnpm workspaces with separate API and Web packages

## Development Commands

### Root Level (use mise for environment tasks)

```bash
# Start development services (PostgreSQL, Redis, RustFS)
mise compose-up-dev

# Stop services
mise compose-down

# Format all code
mise format

# Check code formatting
mise check-format
```

### API Package (cd apps/api)

```bash
# Development server with hot reload
pnpm dev

# Production build
pnpm build

# TypeScript type checking
pnpm typecheck

# ESLint linting
pnpm lint

# Prisma operations
pnpm prisma:generate    # Generate Prisma client
pnpm prisma:migrate     # Run database migrations
pnpm prisma:studio      # Open Prisma Studio GUI
pnpm seed              # Seed database with test data

# Testing
pnpm test:unit         # Run unit tests only
pnpm test:integration  # Run integration tests only
pnpm test:coverage     # Run tests with coverage report
```

### Web Package (cd apps/web)

```bash
# Next.js development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# ESLint linting
pnpm lint
```

## Running Single Tests

### API Tests

```bash
# Run a specific unit test file
pnpm test:unit tests/unit/modules/auth/services.test.ts

# Run a specific integration test file
pnpm test:integration tests/integration/auth/login.test.ts

# Run tests matching a pattern
pnpm test:unit -- --grep "should create user"
```

## Code Style Guidelines

### Formatting (Prettier)

- Print width: 120 characters
- Single quotes: enabled
- Tabs: 2 spaces (no tabs)
- Trailing commas: none
- Arrow parens: always
- Bracket same line: true

### TypeScript Configuration

- Strict mode enabled for both packages
- API targets ESNext with Node.js types
- Web targets ES2017 with React JSX
- Use path aliases: `@/` maps to project root

### Import Conventions

```typescript
// Use import type for type-only imports
import type { FastifySchema } from 'fastify';
import type { User } from '@/types';

// Default imports for classes/functions
import BookService from './services';
import { useState } from 'react';

// Named imports for utilities
import { httpErrors } from '@fastify/sensible';
import { Button, Table } from 'antd';
```

### Naming Conventions

- **Files**: kebab-case for utilities, PascalCase for components/classes
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Interfaces/Types**: PascalCase with descriptive names
- **Database fields**: snake_case (follows Prisma convention)

### Error Handling

```typescript
// API - Use httpErrors from @fastify/sensible
import { httpErrors } from '@fastify/sensible';
if (error.code === 'P2002') throw httpErrors.conflict('Already exists');

// Web - Use messageApi for user notifications
const [messageApi, contextHolder] = message.useMessage();
messageApi.error('Operation failed');
```

## Architecture Patterns

### API Module Structure

Each feature module follows strict structure:

```
modules/<feature>/
├── autohooks.ts    # DI registration + route tags
├── routes.ts       # Route definitions
├── schemas.ts      # TypeBox validation schemas
├── controllers.ts  # Request handlers (thin)
└── services.ts     # Business logic + DB operations
```

### Web Component Patterns

```typescript
// Server Components (default)
export default function Page() {
  return <ClientComponent />;
}

// Client Components (only when needed)
'use client';
export default function InteractiveComponent() {
  const [state, setState] = useState();
  // Interactive logic
}
```

### API Communication

- ALL API calls go through `lib/api/` functions
- Use `fetchApiWithAutoRefresh` for authenticated requests
- Define response types in `lib/api/types.ts`
- Use TanStack Query for data fetching in components

## Database Guidelines

### Prisma Usage

- All database operations in service classes only
- Use typed queries with select/omit for efficiency
- Handle Prisma errors with appropriate HTTP status codes
- Use transactions for multi-step operations

### Migration Workflow

1. Update Prisma schema
2. Run `pnpm prisma:migrate` to create migration
3. Run `pnpm prisma:generate` to update client
4. Update types in services if needed

## Testing Strategy

### Unit Tests

- Mock external dependencies (Prisma, Redis)
- Test service methods in isolation
- Location: `tests/unit/modules/<module>/services.test.ts`

### Integration Tests

- Use real database with test fixtures
- Test complete request/response cycles
- Location: `tests/integration/<module>/<action>.test.ts`
- Use `getAccessToken(app, user)` for authentication

## Security Best Practices

### Authentication

- JWT tokens with refresh flow
- Role-based access control (Admin, Librarian, Member)
- Use auth hooks: `authHook`, `isAdminHook`, `isAdminOrLibrarianHook`

### Data Validation

- All input validation via TypeBox schemas
- Never trust client-side validation
- Use Prisma enums for constrained values

## Common Patterns

### Pagination (API)

```typescript
const [items, total] = await Promise.all([
  this.prisma.resource.findMany({ skip: (page - 1) * limit, take: limit }),
  this.prisma.resource.count({ where: filters })
]);
```

### Search with Debounce (Web)

```typescript
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 500);

const { data } = useQuery({
  queryKey: ['items', page, debouncedSearchTerm],
  queryFn: () => getItems(accessToken, { searchTerm: debouncedSearchTerm })
});
```

### CRUD Operations (Web)

- Use Modal.confirm for destructive actions
- Show loading states during mutations
- Invalidate queries on success
- Reset forms on modal close

## Forbidden Actions

1. ❌ Making API calls directly with fetch() outside lib/api/
2. ❌ Using 'use client' unnecessarily in React components
3. ❌ Accessing Prisma client outside service classes
4. ❌ Throwing raw Error objects (use httpErrors)
5. ❌ Skipping schema validation for any route
6. ❌ Hardcoding configuration values
7. ❌ Using any type without justification
8. ❌ Editing files in src/generated/ directory
9. ❌ Creating routes without corresponding schemas
10. ❌ Storing tokens in localStorage (use Zustand)

## Key Dependencies

### API

- Fastify 5.x with TypeBox validation
- Prisma 7.x with PostgreSQL
- Awilix for dependency injection
- Vitest for testing

### Web

- Next.js 16 with App Router
- React 19 with Server Components
- Ant Design 6.x for UI components
- TanStack Query 5.x for server state
- Zustand for client state

## Environment Setup

1. Use mise for runtime management (Node 25, pnpm 10)
2. Docker services for PostgreSQL, Redis, RustFS
3. Environment files: `.env`, `.env.test`, `.env.example`
4. Use `pnpm` for package management in workspace

## Additional Resources

- Comprehensive AI instructions available in `.github/instructions/`
- Web app guide: 669 lines of detailed Next.js patterns
- API guide: 423 lines of Fastify development guidelines
- These contain complete examples and forbidden actions
