---
applyTo: 'apps/web/**/*.{ts|tsx}'
---

# BookWise Web Architecture Guide

## Overview

The BookWise web app uses **Next.js App Router**, **TypeScript (strict)**, **React 19**, **Ant Design**, and **@tanstack/react-query**. Prefer server components for data access and keep client-side interactivity targeted and minimal.

## Core Technology Stack

- Runtime: Node.js 20+
- Framework: Next.js 16 (App Router)
- UI: React 19 with Ant Design 6
- Styling: Ant Design theme tokens + light Tailwind utility usage; `app/globals.css` for resets/tokens only
- Data: `fetch` on the server; `@tanstack/react-query` for client data
- Auth/UI state: co-located React state; avoid global stores unless necessary
- Package manager: `pnpm` (run from repo root)

## Project Structure (app highlights)

```
apps/web/
├── app/                  # App Router entry
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   ├── (auth)/           # Auth routes (segmented)
│   └── ...
├── hooks/                # Reusable client hooks
├── lib/                  # Fetchers, helpers, constants
├── utils/                # Cross-cutting utilities
└── public/               # Static assets
```

Co-locate route-specific components within their route folder. Shared UI belongs in `_components` directories to avoid circular imports.

## Routing and Components

- Server by default: keep layouts/pages as server components. Add `use client` only when you need client-only APIs, React state, effects, or Ant Design components.
- Loading and error: use `loading.tsx` and `error.tsx` for route states; keep them light and dependency-free when possible.
- Navigation: use `next/link` and `next/navigation`; avoid `window.location`.
- Metadata: prefer `generateMetadata` in server components; keep values deterministic and avoid async calls when possible.

## Styling and UI

- Prefer Ant Design components before custom UI. Customize via props/theme tokens first, then Tailwind utilities. Inline styles only for one-off overrides.
- Limit `app/globals.css` to resets, CSS variables, and shared primitives; avoid page-specific styles there.
- Ensure consistent spacing/typography via design tokens; avoid magic numbers when a token exists.

## Data Fetching and State

- Server data: fetch in server components or route handlers. Set caching intentionally (`cache`, `revalidate`, tags) and avoid redundant fetches in nested layouts.
- Client data: use `@tanstack/react-query` with stable, typed keys. Place fetchers in `lib` or `hooks` and share a small `fetchJson` helper for headers/error handling.
- State: keep global client state minimal; derive from server data when possible. Prefer controlled components for forms.

## Forms and Interactions

- Use semantic form controls with associated labels. For AntD forms, ensure `aria-label` or visible labels exist.
- Handle pending and error states: disable submit buttons while submitting and surface inline errors.
- Avoid heavy client validation in `useEffect`; prefer event-based validation or server validation.

## Performance

- Use `next/image` and `next/font` for assets and typography.
- Dynamic import heavy or rarely used client components; avoid hydrating large trees unnecessarily.
- Avoid unnecessary `useEffect`; prefer server-rendered data and memoized values.

## Accessibility

- Use semantic HTML and keyboard-friendly controls. Provide `alt` text for images and `aria-label` for icon-only buttons.
- Ensure focus-visible styling is present on interactive elements.

## Environment and Secrets

- Only `NEXT_PUBLIC_*` variables may be read on the client. Keep env access near the top of modules.
- Do not embed secrets in client bundles. Prefer server-side usage and pass only needed data to clients.

## Error Handling

- For client fetchers, throw typed errors with `status` and `message`; React Query should map these to UI states.
- Show user-friendly messages; avoid leaking stack traces. Log technical details on the server where needed.

## Testing and Quality

- Add tests for non-trivial helpers/hooks; keep components testable by passing dependencies via props.
- Run `pnpm --filter @book-wise/web lint` before pushing. For significant changes, also run `pnpm --filter @book-wise/web build`.
