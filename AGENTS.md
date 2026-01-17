# Bookwise Development Guidelines

This document contains guidelines and commands for agentic coding agents working on the Bookwise monorepo.

## Project Structure

This is a Turborepo monorepo with:

- `apps/web` - Next.js frontend application
- `apps/api` - NestJS backend API with TypeORM and PostgreSQL
- `packages/shared` - Shared utilities and types
- `packages/sdk` - TypeScript SDK for API communication
- `packages/eslint-config` - ESLint configurations

## Build & Development Commands

### Root Level Commands

```bash
# Install dependencies
pnpm install

# Start all development servers
pnpm dev

# Build all packages and apps
pnpm build

# Run linting across all packages
pnpm lint

# Run type checking across all packages
pnpm typecheck

# Run all tests
pnpm test

# Format code with Prettier
pnpm format
```

### Individual Package Commands

#### Web Frontend (apps/web)

```bash
cd apps/web

# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Type checking
pnpm typecheck
```

#### API Backend (apps/api)

```bash
cd apps/api

# Development server with hot reload
pnpm dev

# Build application
pnpm build

# Run tests
pnpm test

# Run specific test file
pnpm test -- user.service.test.ts

# Run tests in watch mode
pnpm test -- --watch

# Run tests with coverage
pnpm test -- --coverage

# Database migrations
pnpm migration:generate --name migration_name
pnpm migration:run
pnpm migration:show

# Generate SDK from API
pnpm sdk:gen

# Lint code
pnpm lint

# Type checking
pnpm typecheck
```

#### Shared Packages

```bash
cd packages/shared  # or packages/sdk

# Watch build
pnpm dev

# Build package
pnpm build

# Lint (shared only)
pnpm lint

# Type checking
pnpm typecheck
```

## Code Style Guidelines

### General Principles

- Use TypeScript strictly with `strict: true`
- Follow ESLint configurations in `packages/eslint-config`
- Use Prettier for formatting (120 character line width)
- Prefer explicit imports over namespace imports
- Use functional programming patterns where appropriate

### Import Organization

```typescript
// External libraries first
import { ConflictException, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";

// Internal imports with @ aliases
import { User } from "@/database/entities/user";
import { CreateUserBody } from "./user.dto";
```

### API (NestJS) Conventions

- Use dependency injection pattern
- Services handle business logic, controllers handle HTTP
- DTOs for request/response validation
- Use TypeORM decorators for entities
- Throw appropriate HTTP exceptions
- Follow `__tests__` directory structure within each module

#### File Structure for Modules

```
modules/user/
├── user.module.ts
├── user.service.ts
├── user.controller.ts
├── user.dto.ts
└── __tests__/
    └── user.service.test.ts
```

#### Testing Patterns

```typescript
import { beforeEach, describe, it, jest, expect } from "@jest/globals";
import { Test } from "@nestjs/testing";

describe("UserService", () => {
  let service: UserService;
  const mockRepo = { existsBy: jest.fn(), create: jest.fn(), save: jest.fn() };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [UserService, { provide: getRepositoryToken(User), useValue: mockRepo }],
    }).compile();
    service = moduleRef.get(UserService);
    jest.clearAllMocks();
  });
});
```

### Web (Next.js) Conventions

- Use App Router structure
- Components follow PascalCase file names
- Custom hooks start with `use` and are camelCase
- Use TypeScript generics for type safety
- Prefer functional components with hooks
- Use `clsx` for conditional classes

#### Component Patterns

```typescript
import * as React from "react";

export function ComponentName({ prop }: { prop: string }) {
  return <div>{prop}</div>;
}
```

### Type Definitions

- Use explicit type annotations for function returns
- Prefer interface for object shapes with implementation
- Use type for unions, intersections, and utility types
- Leverage Zod for runtime validation schemas

### Error Handling

- Use appropriate HTTP status codes and exceptions in API
- Implement proper error boundaries in React
- Log errors appropriately without exposing sensitive data
- Use try-catch blocks for async operations that might fail

### Database (TypeORM)

- Use snake_case for column names in database
- Use camelCase for TypeScript properties
- Always define entities with proper decorators
- Use migrations for schema changes
- Index foreign keys and frequently queried columns

### Naming Conventions

- Files: kebab-case for utilities, PascalCase for components
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Classes and Interfaces: PascalCase
- Enums: PascalCase with descriptive names

### Git Hooks

- Pre-commit hooks run lint-staged to ensure code quality
- Husky manages Git hooks automatically
- Lint-staged runs ESLint on staged TypeScript files

## Development Environment

### Requirements

- Node.js 22 (managed by mise)
- pnpm 10 (package manager)
- Docker for development services
- dotenvx for environment variable management

### Development Services

```bash
# Start required services (PostgreSQL, Redis, RustFS)
mise task compose-dev
```

### Environment Variables

Use `.env` files with dotenvx for environment management. Never commit secrets to the repository.

## Testing Guidelines

### API Testing

- Unit tests for services with mocked repositories
- Focus on business logic testing
- Use Jest with ts-jest preset
- Test both success and error scenarios

### Frontend Testing

- Component testing with appropriate tools
- Integration tests for user flows
- Accessibility testing considerations

## Performance Considerations

- Database queries should be optimized with proper indexing
- Implement pagination for large datasets
- Use React.memo and useMemo for expensive computations
- Bundle size optimization in Next.js
- Use caching strategies appropriately

## Security Best Practices

- Input validation with Zod schemas
- Proper authentication and authorization
- Environment-based configuration
- Secure headers with Fastify Helmet
- SQL injection prevention with TypeORM
