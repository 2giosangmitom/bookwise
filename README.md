# BookWise - A university library management system

![GitHub Last Commit](https://img.shields.io/github/last-commit/2giosangmitom/library-management?style=for-the-badge&logo=github&color=7dc4e4&logoColor=D9E0EE&labelColor=302D41)
![Codecov](https://img.shields.io/codecov/c/github/2giosangmitom/library-management?style=for-the-badge&logo=codecov&logoColor=F01F7A&labelColor=302D41)
![GitHub Repo stars](https://img.shields.io/github/stars/2giosangmitom/library-management?style=for-the-badge&logo=apachespark&color=eed49f&logoColor=D9E0EE&labelColor=302D41)

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
