# Bookwise Agent Guide

This repository is a monorepo using **pnpm** and **Turbo**. It contains a NestJS API, a Next.js web application, and shared packages.

## 🛠 Project Structure

- **apps/api**: NestJS backend (Fastify adapter, TypeORM, Postgres).
- **apps/web**: Next.js frontend (App Router, Tailwind CSS).
- **packages/shared**: Shared types, DTOs, and schemas (Zod).
- **packages/eslint-config**: Shared ESLint configuration.

## 🚀 Build, Lint & Test Commands

### Root Commands (Turbo)

Run these from the root to execute across all workspaces:

- **Build**: `pnpm build` (runs `turbo run build`)
- **Lint**: `pnpm lint` (runs `turbo run lint`)
- **Typecheck**: `pnpm typecheck` (runs `turbo run typecheck`)
- **Test**: `pnpm test` (runs `turbo run test`)
- **Format**: `pnpm format` (runs Prettier)

### Running Single Tests

**API (Jest):**
To run a specific test file in the API:

```bash
# From apps/api directory
pnpm test -- src/modules/auth/auth.service.spec.ts

# Watch mode for a specific file
pnpm test -- --watch src/modules/auth/auth.service.spec.ts
```

## 📐 Code Style & Conventions

### General

- **Strict TypeScript**: No `any`. Use strict typing.
- **Formatting**: Adhere to Prettier settings (`printWidth: 120`).
- **Files**: Use kebab-case for filenames (e.g., `user-profile.service.ts`).
- **Classes/Components**: Use PascalCase (e.g., `UserProfileService`, `Button`).

### Imports

- **Internal (API)**: Use the `@/` alias for internal imports.
  ```typescript
  import { ZodValidationPipe } from "@/pipes/zod"; // Good
  import { ZodValidationPipe } from "../../pipes/zod"; // Avoid
  ```
- **Shared Packages**: Import from `@bookwise/*` workspaces.
  ```typescript
  import { signUpSchema } from "@bookwise/shared";
  ```

### Backend (apps/api)

- **Framework**: NestJS with Fastify.
- **Validation**: Use **Zod** schemas (often from `@bookwise/shared`) with pipes.
  - DO NOT use `class-validator` unless strictly necessary; prefer Zod.
- **Database**: TypeORM with Postgres.
- **Response Handling**:
  - Use Standard NestJS decorators (`@Body`, `@Query`).
  - Use `FastifyReply` for specific response manipulation only when needed.
- **Documentation**: heavily rely on `@nestjs/swagger`. Use `@ApiBody`, `@ApiCreatedResponse` with Zod schemas converted via `z.toJSONSchema`.

### Frontend (apps/web)

- **Framework**: Next.js App Router (`app/` directory).
- **Styling**: Tailwind CSS.
- **Components**: Functional components.
- **Icons**: `lucide-react`.

### Shared Library (packages/shared)

- Place common Zod schemas, DTOs, and Enums here.
- Build using `tsdown`.
- Export everything from `src/index.ts`.

## 🛡️ Error Handling

- **API**: Use NestJS Exception Filters.
- **Validation**: Zod parsing errors are handled via global pipes/filters.

## 📦 Package Management

- Use `pnpm add <package>` to install dependencies.
- To add a dependency to a specific workspace:
  ```bash
  pnpm add <package> --filter @bookwise/api
  ```
- **NEVER** use npm or yarn.

## 📝 Commit Guidelines

- Follow conventional commits (e.g., `feat: add user login`, `fix: resolve db connection`).
- Pre-commit hooks via Husky are configured.
