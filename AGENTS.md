# AGENTS.md

## Quick reference

| Need | Command |
|---|---|
| Dev server | `pnpm dev` |
| Lint | `pnpm lint` |
| Format check | `pnpm format:check` |
| Auto-format | `pnpm format` |
| Build (typecheck + Vite) | `pnpm build` |
| Find unused deps/exports | `pnpm knip` |

**No test framework exists.** Do not run or write tests unless asked.

## Architecture

```
src/
├── routes/          ← TanStack Router file-system routes (auto-generates routeTree.gen.ts)
├── features/        ← Business modules (auth, websites, blackwords, tasks, …)
├── components/
│   ├── ui/          ← Shadcn UI components (generated, excluded from lint/knip)
│   ├── layout/      ← Shell, sidebar, header, authenticated-layout
│   ├── data-table/  ← Reusable data-table primitives
│   └── smart/       ← Enhanced components (datetime, etc.)
├── context/         ← Theme, font, direction (RTL), search, layout providers
├── stores/          ← Zustand stores (auth-store)
├── hooks/           ← Custom hooks
├── lib/             ← Utils (cn, cookies, error handling, etc.)
├── config/          ← Fonts, pagination config
└── styles/          ← Tailwind v4 CSS (index.css, theme.css)
```

## Key conventions and gotchas

### Package manager
- **pnpm only.** CI uses `pnpm install --frozen-lockfile`. There is no `package-lock.json` or `yarn.lock`.

### Auto-generated files — do not edit
- **`src/routeTree.gen.ts`** — regenerated on route changes by the TanStack Router Vite plugin. Excluded from ESLint, Prettier, and knip.
- **`src/components/ui/**`** — Shadcn CLI output. Excluded from ESLint and knip. Customizations (RTL support) exist on: scroll-area, sonner, separator, alert-dialog, calendar, command, dialog, dropdown-menu, select, table, sheet, sidebar, switch. Preserve RTL changes when updating shadcn components.

### Routing
- **Pattern**: Every feature has a route file at `src/routes/_authenticated/<feature>/index.tsx` that simply renders the feature component from `src/features/<feature>/`.
- **Auth gate**: `src/routes/_authenticated/route.tsx` wraps all authenticated routes in `<SignedIn>` / `<SignedOut>` via Clerk.
- **Route search params** are validated with Zod schemas in the route file, not inline in feature components.

### Feature module structure
```
src/features/<name>/
├── index.tsx              ← Main page component (renders Provider + Content)
├── api/<name>.ts          ← TanStack Query hooks + API calls
├── data/schemas.ts        ← Zod schemas, types
├── data/labels.tsx        ← Display labels/maps for enum values
└── components/            ← Table, dialogs, drawers, provider, actions/, cells/
```

### State management
- **Server state**: TanStack Query (React Query). Default staleTime 10s, no retry in dev, max 3 retries in prod, no retry on 401/403.
- **Local state**: Zustand (currently only `auth-store`).
- **URL state**: Route search params (validated with Zod).

### Tailwind CSS v4
- No `tailwind.config.*` file — config is in CSS via `@import 'tailwindcss'` and `@theme` blocks.
- CSS entry: `src/styles/index.css` imports Tailwind, `tw-animate-css`, and `theme.css`.

### ESLint rules that will fail CI
- **`no-console: error`** — only override with `// eslint-disable-next-line` when truly needed.
- **`@typescript-eslint/consistent-type-imports: error`** — use `import type { Foo }` for type-only imports.
- **`no-duplicate-imports: error`** — do not import from the same module in separate statements.

### Import order (enforced by Prettier plugin)
```
path → vite → react → globals/zod/axios → radix-ui → tanstack → third-party → @/ → relative
```
Prettier sorts imports automatically on `pnpm format`. Run `pnpm format:check` before pushing.

### Build
- `pnpm build` runs `tsc -b && vite build`. TypeScript project references must typecheck before Vite bundles.
- Netlify deploys with an SPA redirect rule (`/*` → `/index.html`, 200).

### Environment
- `VITE_API_URL` (defaults to `http://127.0.0.1:8888`).
- Copy `.env.example` to `.env` and fill in real values.
