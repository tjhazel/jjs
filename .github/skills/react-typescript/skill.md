---
name: react-typescript
description: General React 19 and TypeScript development conventions for the JJS web application, including project structure, routing, data fetching, authentication, typing, forms, styling, and validation.
---

# React and TypeScript Development

Use this skill for general frontend work in `jjs-web/`. Apply the `mantine-frontend`
skill as an additional guide when the request changes Mantine components, layouts,
forms, or theming.

## Technology Stack

- React 19.2 with the React JSX transform
- TypeScript 6 with strict unused-code checks
- Vite 8
- React Router 8 with `createBrowserRouter`
- SWR for list and interactive data fetching
- Axios through the shared HTTP client
- Zod for schemas and validation
- Mantine UI 9 for application UI

## Project Structure

```text
jjs-web/src/
├── api/          # API contexts, fetchers, models, and schemas by domain
├── components/   # Reusable domain, layout, and UI components
├── lib/          # Auth, HTTP, storage, configuration, and shared utilities
├── pages/        # Route-level page components
├── App.tsx       # Root providers and application shell
├── main.tsx      # Vite entry point
└── routes.tsx    # Browser router and route loaders
```

Keep domain code in its existing domain folder. Put reusable behavior in
`components/` or `lib/` only when it is genuinely shared.

## Core Rules

- Prefer function components and hooks; do not introduce class components.
- Keep TypeScript strict and use explicit types for public component props,
  API models, context values, and hook return values.
- Use `import type` for type-only imports because `verbatimModuleSyntax` is enabled.
- Do not use TypeScript `enum`; use `as const` objects and union types.
- Avoid `any`, unnecessary type assertions, and non-null assertions. Narrow
  unknown values with type guards or schemas.
- Reuse the existing `ApiContext`, `httpClient`, auth context, SWR helpers, and
  storage utilities instead of creating parallel infrastructure.
- Preserve the existing provider hierarchy and route protection model.

## Routing and Data

- Add routes in `src/routes.tsx` and keep route-level components under `src/pages/`.
- Use route loaders for detail pages that need data before rendering.
- Use SWR for collection views, live interactions, cache-aware reads, and
  optimistic updates.
- Keep API calls in `src/api/<domain>/` fetcher files and model/schema definitions
  beside them.
- Build API URLs through the shared context/configuration; do not hard-code
  environment-specific hosts.
- Surface request failures through the existing error and notification patterns;
  do not silently swallow errors.

## Forms, Auth, and Styling

- Define Zod schemas beside the related API model or feature.
- Use the existing authentication context and protected-route components for
  identity and role checks; never duplicate token storage or authorization logic.
- Prefer CSS modules or existing Mantine styling conventions over ad hoc global CSS.
- Keep responsive behavior compatible with the existing public, dashboard, and
  admin layouts.
- Preserve accessibility: use semantic elements, labels, keyboard interaction,
  and meaningful loading/error states.

## Validation

From `jjs-web/`, use the existing project commands:

```text
npm run build
npm run lint
```

There is currently no frontend test script configured, so do not assume
`npm test` is available.
