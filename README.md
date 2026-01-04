# 📚 BookWise

**University Library Management System**

**BookWise** is a full-stack library management system designed for university environments.
The project focuses on **clean architecture**, **strict typing**, and **real-world backend/frontend workflows**, with a clear separation between API and Web clients inside a pnpm monorepo.

## ✨ Key Features

### 🔐 Access Control

- Role-based access control (RBAC): **Admin**, **Librarian**, **Member**
- JWT authentication with refresh token rotation
- Route-level authorization via reusable Fastify hooks

### 📚 Library Management

- Book catalog management (books, authors, categories, publishers, locations)
- Physical inventory tracking via **book copies (clones)**
- Loan lifecycle: checkout, return, overdue handling
- Ratings and reviews from members

### 🔍 Search & Usability

- Server-side pagination and filtering
- Full text search with case-insensitive matching
- Clean admin & staff dashboard UI

## 🧱 Monorepo Architecture

```text
apps/
├── api/        # Fastify REST API
│   ├── Prisma + PostgreSQL
│   ├── Redis cache
│   ├── TypeBox schemas (request & response)
│   └── Strict service / controller separation
│
├── web/        # Next.js Web Application
│   ├── App Router (Server Components by default)
│   ├── Ant Design UI
│   └── TanStack Query for server state
```

The monorepo is managed with **pnpm workspaces**, allowing shared tooling, consistent TypeScript configuration, and clean dependency boundaries.

## 🛠 Tech Stack

### Backend (API)

- **Fastify 5** with TypeBox type provider
- **Prisma ORM** + PostgreSQL
- **Redis** for caching
- **JWT authentication**
- **Awilix DI container**
- **Vitest** (unit & integration tests)
- **Docker** for local development

### Frontend (Web)

- **Next.js 16** (App Router, React Server Components)
- **React 19**
- **Ant Design 6**
- **TanStack Query 5**
- **Zustand** for token management
- **Tailwind CSS** for layout utilities

### Cross-cutting

- End-to-end **TypeScript**
- Strict linting and formatting
- Environment-based configuration

## 🧩 Backend Architecture Highlights

The API is organized by **feature-based modules**, each following a strict internal structure:

```text
modules/<feature>/
├── schemas.ts      # TypeBox request/response schemas
├── routes.ts       # Route definitions only
├── controllers.ts  # Thin controllers (no business logic)
├── services.ts     # Business logic & database access
└── autohooks.ts    # DI registration & shared hooks
```

**Key principles:**

- No business logic in routes or controllers
- All validation and serialization via TypeBox schemas
- All database access isolated in service classes
- Errors handled consistently via `@fastify/sensible`
- Dependency injection enforced via Awilix

This structure enables predictable growth as features expand.

## 🧩 Frontend Architecture Highlights

- **Server Components by default**, Client Components only when required
- Centralized API client with **automatic token refresh**
- Clear separation between:
  - UI components
  - API layer (`lib/api`)
  - Global auth state (Zustand)

- CRUD pages follow consistent patterns (Table + Modal + Mutation)

The frontend mirrors backend discipline to keep complexity manageable.

## 🧪 Testing Strategy

- **Integration tests** with real database for API endpoints
- **Unit tests** for services with mocked dependencies
- Separate test environments and setup helpers

## 🤖 Use of AI Assistance

This project makes active use of **GitHub Copilot** to assist with code generation.

- Approximately **50% of the code was AI-generated**
- All generated code follows **strict, predefined coding rules**
- Architecture decisions, validation rules, and final review remain **fully human-controlled**

> Copilot is treated as a productivity tool, not a replacement for architectural or design decisions.

## 🎯 Learning Goals

This project is primarily built to practice:

- Designing scalable backend architectures
- Building type-safe APIs
- Managing complexity in full-stack applications
- Applying production-grade patterns early in learning
