# syntax=docker/dockerfile:1

# ── ParaTunisie admin (Next.js standalone) ────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/admin/package.json ./apps/admin/
COPY packages ./packages
RUN npm install && cd apps/admin && npm install

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/admin/node_modules ./apps/admin/node_modules
COPY apps/admin ./apps/admin
COPY packages ./packages
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time — a
# runtime `environment:` entry in docker-compose.prod.yml has no effect on
# them (D-0034). Must be passed as a build arg instead.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build --prefix apps/admin

FROM node:22-alpine AS runner
WORKDIR /app/apps/admin
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public
USER nextjs
EXPOSE 3002
CMD ["node", "apps/admin/server.js"]
