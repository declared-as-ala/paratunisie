# Rollback

- **Web/admin images:** `docker tag` rollback tags exist (`rollback-*`). Roll back by pointing the compose service to the tag, then `docker compose -f docker-compose.prod.yml up -d --no-deps <service>`.
- **Source:** dated tarballs in `/root/paratunisie-backups/src-before*.tgz`.
- **Database:** `pg_dump -Fc` files `db-before-sobitas-sync-*.dump`, `db-pre-apply-*.dump`. Restore into a scratch DB first (`createdb x; pg_restore -d x file`).
- **Redirects / schema change (Batch 1):** revert the 5 entries in `next.config.ts` and the return-policy block in `src/lib/seo/schema.ts`, rebuild the web image.
