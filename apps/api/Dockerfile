# syntax=docker/dockerfile:1

# ── ParaTunisie API (NestJS) ──────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate \
    && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
RUN apk add --no-cache openssl \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nodejs
# Full node_modules (incl. devDeps) kept on purpose: the dev startup flow
# runs `prisma migrate deploy` + `prisma db seed` (ts-node) at container start.
COPY --from=deps /app/node_modules ./node_modules
# Copy generated Prisma client (overrides the pre-generate version in deps node_modules) —
# generated once at build time; the startup command must not regenerate it, since COPY
# runs as root and the nodejs user has no write access to node_modules afterward.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
RUN chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
