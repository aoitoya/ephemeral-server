FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@10.16.0 --activate

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY turbo.jsonc ./
COPY pnpm-workspace.yaml ./

COPY apps/server/package.json apps/server/
COPY apps/web-client/package.json apps/web-client/

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY apps/server/tsconfig.build.json apps/server/tsconfig.json apps/server/
COPY apps/server/src apps/server/src

COPY apps/web-client/index.html apps/web-client/
COPY apps/web-client/tsconfig.json apps/web-client/
COPY apps/web-client/vite.config.ts apps/web-client/
COPY apps/web-client/src apps/web-client/src

RUN pnpm turbo build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=builder /app/apps/web-client/dist ./frontend-dist

ENV FRONTEND_DIST=/app/frontend-dist

USER nodejs

EXPOSE 3000

ENTRYPOINT ["node", "/app/apps/server/dist/index.js"]

