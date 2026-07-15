# AGENTS.md

## Repo structure

Two independent packages (no root workspace/monorepo config):
- `backend/` — NestJS 11 API, Prisma 7, PostgreSQL, JWT auth
- `frontend/` — Nuxt 4, Tailwind CSS v4, shadcn-vue, Pinia

## Developer commands

### Backend (`backend/`)
```bash
npm install
npm run start:dev    # dev server on :4000
npm run build        # nest build
npm run test         # unit tests (jest, *.spec.ts in src/)
npm run test:e2e     # e2e tests (test/ directory)
npm run lint         # eslint --fix
npm run format       # prettier
npx prisma migrate dev   # run migrations
npx prisma generate      # regenerate client
npx prisma db seed       # seed (prisma/seeders/)
```

### Frontend (`frontend/`)
```bash
npm install
npm run dev          # dev server on :3000
npm run build        # nuxt build
npm run preview      # preview production build
npm run generate     # static site generation
```

## Environment

- Backend expects PostgreSQL on `localhost:5433` (see `backend/.env`)
- Frontend proxies API to `localhost:4000` (via `NUXT_PUBLIC_API_BASE`)
- Backend env vars: `DATABASE_URL`, `JWT_SECRET`, `RESEND_API_KEY`, `FRONTEND_URL`

## Key architecture notes

- Backend modules: `AuthModule` (JWT, bcrypt, password reset via Resend email), `TodosModule`, `DatabaseModule` (Prisma)
- Prisma schema at `backend/prisma/schema.prisma` — models: `User`, `Todo`
- Migrations in `backend/prisma/migrations/`
- Frontend uses shadcn-vue components in `frontend/components/ui/`
- No CI workflows exist yet
- CODEOWNERS: `@jetrossgalinato` owns everything

## Gotchas

- Backend `noImplicitAny` is **off** — type safety is loose
- No root-level lockfile or workspace config — install dependencies per package
- Backend has duplicate auth code: `src/auth/` and `src/modules/auth/` — prefer `src/auth/` (used by AppModule)
