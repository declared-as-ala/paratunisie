#!/usr/bin/env bash
set -e

# ── ParaTunisie Production Deployment Script ──────────────────────────────
# Location on VPS: /opt/paratunisie/app/scripts/deploy-production.sh

PROJECT_DIR="/opt/paratunisie/app"
BACKUP_DIR="/opt/paratunisie/backups"
LOCK_FILE="/tmp/paratunisie-deploy.lock"
COMPOSE_FILE="docker-compose.prod.yml"

mkdir -p "${BACKUP_DIR}"

# 1. Deployment Concurrency Lock
exec 200>"$LOCK_FILE"
flock -n 200 || { echo "[DEPLOY ERROR] Deployment already in progress. Exiting."; exit 1; }

echo "=========================================================="
echo " Starting ParaTunisie Production Deployment "
echo " Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "=========================================================="

cd "${PROJECT_DIR}"

# Record current commit before update
PREV_COMMIT=$(git rev-parse HEAD || echo "unknown")
NEW_COMMIT=$(git rev-parse origin/main || echo "latest")
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/pre-deploy-${PREV_COMMIT:0:7}-${TIMESTAMP}.dump"

echo "[1/7] Creating pre-deployment PostgreSQL backup..."
if docker ps | grep -q paratunisie-postgres; then
  docker exec paratunisie-postgres pg_dump -U paratunisie -d paratunisie -Fc -f /tmp/pre-deploy.dump || true
  docker cp paratunisie-postgres:/tmp/pre-deploy.dump "${BACKUP_FILE}" || true
  echo "  ✓ Pre-deploy backup saved to ${BACKUP_FILE}"
else
  echo "  ⚠ PostgreSQL container not running yet, skipping pre-deploy dump."
fi

# Cleanup old backups (keep last 14 days)
find "${BACKUP_DIR}" -name "pre-deploy-*.dump" -mtime +14 -delete || true

echo "[2/7] Pulling latest code from GitHub..."
if [ -n "$(git status --porcelain)" ]; then
  echo "[DEPLOY ERROR] Uncommitted changes found in ${PROJECT_DIR} — refusing to overwrite. Inspect with 'git status' before deploying manually."
  git status --porcelain
  exit 1
fi
git fetch origin main
git reset --hard origin/main

echo "[3/7] Building Docker production containers..."
docker compose -f ${COMPOSE_FILE} build --parallel

echo "[4/7] Applying Prisma migrations (production-safe)..."
docker compose -f ${COMPOSE_FILE} run --rm paratunisie-api npx prisma migrate deploy

echo "[5/7] Starting services..."
docker compose -f ${COMPOSE_FILE} up -d --remove-orphans

echo "[6/7] Running health checks..."
MAX_RETRIES=12
RETRY_COUNT=0
HEALTHY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  sleep 5
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "  Health check attempt ${RETRY_COUNT}/${MAX_RETRIES}..."
  
  API_STATUS=$(docker inspect --format='{{json .State.Health.Status}}' paratunisie-api 2>/dev/null || echo '"unknown"')
  WEB_STATUS=$(docker inspect --format='{{json .State.Health.Status}}' paratunisie-web 2>/dev/null || echo '"unknown"')
  
  if [ "$API_STATUS" = '"healthy"' ] && [ "$WEB_STATUS" = '"healthy"' ]; then
    HEALTHY=true
    break
  fi
done

if [ "$HEALTHY" = true ]; then
  echo "=========================================================="
  echo "  ✓ Deployment SUCCESSFUL!"
  echo "  Active Commit: $(git rev-parse HEAD)"
  echo "=========================================================="
  exit 0
else
  echo "=========================================================="
  echo "  ❌ Health check FAILED! Initiating container rollback..."
  echo "=========================================================="
  git checkout "${PREV_COMMIT}"
  docker compose -f ${COMPOSE_FILE} build
  docker compose -f ${COMPOSE_FILE} up -d
  echo "Rollback completed. Please inspect logs with: docker compose -f ${COMPOSE_FILE} logs --tail=100"
  exit 1
fi
