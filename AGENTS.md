# Bookwise Agent Guide

This monorepo uses **pnpm** workspaces and **Turbo**. It contains a NestJS API, a Next.js web app, and shared packages. These instructions are for any agentic coding tools (like this one) working in this repository.

## 🧭 Project Layout

- `apps/api`: NestJS backend (Fastify, TypeORM, Postgres).
- `apps/web`: Next.js App Router frontend with Tailwind.
- `packages/shared`: Shared Zod schemas, DTOs, and enums.
- `packages/api-client`: Typed API client for the web app.
- `packages/eslint-config`: Shared ESLint configuration (`@bookwise/eslint-config`).

## 🚀 Build, Lint, Typecheck & Test

### Root (Turbo / All Workspaces)

Run these from the repo root:

- `pnpm build` – `turbo run build` across all apps/packages.
- `pnpm dev` – `turbo run dev` (usually API + Web).
- `pnpm lint` – `turbo run lint` using shared ESLint config.
- `pnpm typecheck` – `turbo run typecheck` using `tsc --noEmit`.
- `pnpm test` – `turbo run test` (primarily API Jest tests).
- `pnpm format` – `prettier --write` (uses root `prettier` config).

### API (`apps/api`)

From `apps/api`:

- `pnpm dev` – `nest start --watch`.
- `pnpm build` – `nest build`.
- `pnpm lint` – `eslint` (uses `@bookwise/eslint-config/api`).
- `pnpm typecheck` – `tsc --noEmit`.
- `pnpm test` – `jest` (NestJS + SWC).

**Run a single test file (API/Jest):**

```bash
# From apps/api directory
pnpm test -- src/modules/auth/auth.service.spec.ts

# Watch mode for a specific file
pnpm test -- --watch src/modules/auth/auth.service.spec.ts

# Filter by test name (regex) in a file
pnpm test -- src/modules/auth/auth.service.spec.ts -t "should create user"
```

### Web (`apps/web`)

From `apps/web`:

- `pnpm dev` – `next dev`.
- `pnpm build` – `next build`.
- `pnpm start` – `next start`.
- `pnpm lint` – `eslint` (uses `@bookwise/eslint-config/web`).
- `pnpm typecheck` – `tsc --noEmit`.

(Currently there are no project-specific Jest/Playwright tests configured in `apps/web`; add new tests close to features if needed.)

## 📐 General Code Style

- **Language**: Strict TypeScript across all workspaces.
- **No `any`**: Avoid `any`. Prefer precise types, generics, or `unknown` + narrowing.
- **Formatting**: Use Prettier (root `printWidth: 120`). Do not hand-wrap lines differently.
- **Filenames**: Use kebab-case (e.g. `user-profile.service.ts`, `book-list-item.tsx`).
- **Classes/Components**: Use PascalCase (`UserProfileService`, `BookList`, `AuthController`).
- **Functions/Variables**: Use camelCase with descriptive names (`createSignedUrl`, `fetchCurrentUser`).
- **Enums / Const Objects**: Use PascalCase for enums and SCREAMING_SNAKE_CASE for constant values.
- **Modules**: Prefer one main concept per file (controller, service, component, etc.).

## 📦 Imports & Module Boundaries

- **Root API imports**: Use `@/` alias within `apps/api` for internal modules.
  ```ts
  import { ZodValidationPipe } from "@/pipes/zod"; // Preferred
  // Avoid deep relative traversal
  import { ZodValidationPipe } from "../../pipes/zod"; // Avoid
  ```
- **Shared packages**: Import from `@bookwise/*` workspaces.
  ```ts
  import { signUpSchema } from "@bookwise/shared";
  import { apiClient } from "@bookwise/api-client";
  ```
- **Web imports**:
  - Use path aliases defined in `apps/web/tsconfig.json` (e.g. `@/components/...`, `@/lib/...`) instead of deep `../../../`.
  - Group imports: builtin -> third-party -> internal. Keep type-only imports as `import type` where appropriate.
- **Side effects**: Keep side-effect imports explicit (e.g. polyfills, global styles).

## 🧪 Testing Guidelines

- Prefer **Jest** for backend unit/integration tests in `apps/api`.
- Place API tests next to implementation modules under `src/modules/**` when possible.
- Use clear test names (`it('returns 401 when token invalid', ...)`).
- Mock external services (DB, S3, Redis) where necessary; avoid slow network calls.
- For regression bugs, first add/extend a test that reproduces the issue, then fix.

## 🧱 Backend (apps/api) Conventions

- **Framework**: NestJS with Fastify adapter.
- **Validation**: Prefer **Zod** schemas, often from `@bookwise/shared`.
  - Do NOT introduce `class-validator` / `class-transformer` unless absolutely required.
  - Use request DTO schemas + a Zod-based pipe (e.g. `ZodValidationPipe`).
- **Database**: TypeORM with Postgres; keep entities in domain-specific modules.
- **Migrations**:
  - Use `pnpm migration:generate` / `pnpm migration:run` scripts in `apps/api`.
  - All schema changes must go through migrations.
- **Swagger / OpenAPI**:
  - Use `@nestjs/swagger` decorators (`@ApiTags`, `@ApiBody`, `@ApiOkResponse`, etc.).
  - Prefer Zod schemas converted to JSON Schema (e.g. `zodSchema.toJSONSchema()`).

### API Error Handling

- Use NestJS **Exception Filters** for cross-cutting concerns.
- Throw NestJS HTTP exceptions (`BadRequestException`, `UnauthorizedException`, etc.) rather than generic `Error`.
- For validation issues, rely on the global Zod validation/exception pipeline instead of manual checks wherever possible.
- When catching errors:
  - Log relevant context (user id, request id) via Nest logger.
  - Re-throw as a proper HTTP exception with a safe, non-sensitive message.

## 🎨 Frontend (apps/web) Conventions

- **Framework**: Next.js App Router (`app/` directory).
- **Components**: Functional React components only.
- **Styling**: Tailwind CSS + `tailwind-merge`/utility helpers.
- **Icons**: `lucide-react` is the standard icon set.
- **Data fetching**:
  - Prefer `@tanstack/react-query` for server state.
  - Keep pure helpers in `@/lib` and UI-only concerns in `@/components`.
- **Forms & validation**:
  - Use Zod schemas (often shared from `@bookwise/shared`) and whatever form library is configured (e.g. `@tanstack/react-form`).
  - Never duplicate validation logic; share Zod schemas between API and Web where possible.
- **Client/server components**: Mark client components with `"use client"` only when needed.

### Frontend Error Handling

- Use Next.js error boundaries (`error.tsx`) and not-found routes (`not-found.tsx`) for routing-related failures.
- Prefer user-friendly error messages; never surface raw stack traces.
- Use toast/notification components (e.g. `sonner`) for transient errors.

## 🧾 ESLint & Formatting

- All workspaces use shared ESLint config from `@bookwise/eslint-config` (`./base`, `./web`, `./api`).
- Treat ESLint errors as build blockers; do not add `eslint-disable` comments unless absolutely necessary and localized.
- Prettier is integrated via `eslint-plugin-prettier` in the shared config; do not hand-format code.
- Husky + lint-staged run `pnpm lint --` on staged `*.{ts,tsx,js,mjs}` files; keep changes small and passing lint.

## 📦 Package Management

- Use `pnpm` only. **Never** use `npm` or `yarn`.
- To add a dependency to a specific workspace:
  ```bash
  pnpm add <package> --filter @bookwise/api
  pnpm add <package> --filter @bookwise/web
  ```
- Prefer workspace references (`workspace:*`) for internal packages.

## 🧑‍💻 Git & Commits

- Follow **Conventional Commits**:
  - `feat: add user login`
  - `fix: resolve db connection`
  - `refactor: simplify book search`
  - `chore: bump dependencies`
- Keep commits focused and small; ensure lint, typecheck, and tests pass before committing.
- Do not commit `.env*` or other secrets.

---

If you add new tools, scripts, or conventions, update this AGENTS.md so future agents can follow the same rules.
