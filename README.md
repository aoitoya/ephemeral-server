# ephemeral-server

Social platform with ephemeral messaging, real-time updates, and media uploads.

## Stack

- Node.js 22+ / Express.js 5.x / TypeScript 5.x
- PostgreSQL + Drizzle ORM
- Socket.IO for real-time
- Vitest + supertest
- Zod validation / Pino logging

## Commands

```bash
pnpm dev          # Development server
pnpm build        # TypeScript compilation
pnpm test         # Run tests
pnpm lint         # ESLint
pnpm format       # Prettier
```

## Environment

See `.env.example` for required variables. S3 required for media uploads.

## Architecture

```
src/
├── config/       # Environment, logger
├── constants/    # Shared constants
├── db/           # Drizzle schema + migrations
├── middleware/   # Auth, rate limiting, upload
├── modules/      # Feature modules (users, posts, media, etc.)
├── shared/       # Errors, utilities
└── socket/       # Socket.IO handlers
```

Frontend repo: https://github.com/aoitoya/ephemeral-client
