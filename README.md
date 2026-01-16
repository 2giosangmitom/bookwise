# Bookwise

A modern library management system built with a monorepo architecture using TypeScript, NestJS, Next.js, and PostgreSQL.

## Overview

Bookwise is a comprehensive library management solution that allows users to browse, borrow, and manage books. The system supports multiple user roles and provides a modern web interface for both librarians and library patrons.

## Features

- 📚 **Book Management**: Catalog books with authors, publishers, and categories
- 👥 **User Management**: Support for different user roles (librarians, patrons)
- 📖 **Loan System**: Track book loans and due dates
- 🔄 **Reservations**: Allow users to reserve books
- 📊 **Inventory Management**: Manage book copies and availability
- 🔍 **Search & Discovery**: Find books by title, author, or category
- 🎨 **Modern UI**: Built with Next.js and Tailwind CSS
- 🚀 **High Performance**: Fast API with Fastify and optimized database queries
- 🔧 **Type-Safe API**: Auto-generated SDK and OpenAPI docs via Nestia

## Tech Stack

### Backend (apps/api)

- **Framework**: NestJS with Fastify
- **API Generation**: Nestia (typed SDK and OpenAPI generation)
- **Database**: PostgreSQL with TypeORM
- **Validation**: Typia with nestia decorators
- **Authentication**: JWT tokens
- **File Storage**: AWS S3
- **Caching**: Redis
- **Testing**: Jest

### Frontend (apps/web)

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query
- **Forms**: TanStack Form
- **UI Components**: Radix UI
- **Icons**: Lucide React

### Shared Packages

- **@bookwise/shared**: Common types.
- **@bookwise/sdk**: Auto-generated SDK for the Bookwise API (via Nestia)
- **@bookwise/eslint-config**: Shared ESLint configuration

### Infrastructure

- **Build System**: Turbo (monorepo orchestration)
- **Package Manager**: pnpm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged
