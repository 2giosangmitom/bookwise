# BookWise - A university library management system

**BookWise** is a library management platform for universities. It covers cataloging, circulation, and staff workflows with clear separation between an API service and a web client.

## Monorepo layout

- [apps/api](apps/api): Fastify + TypeBox API, Prisma, Redis, PostgreSQL
- [apps/web](apps/web): Next.js + Ant Design frontend

## Features

- Role-based access for admins, librarians, and members
- Catalog management for books, authors, categories, publishers, and locations
- Inventory tracking for physical copies (book clones)
- Loan workflows: checkout, return, and overdue handling
- Ratings and reviews
- Search and filtering with pagination

## Tech stack

- Fastify, TypeBox, Prisma, PostgreSQL, Redis
- Next.js, Ant Design
- Vitest for unit and integration tests
- Docker for local services
- TypeScript end to end
