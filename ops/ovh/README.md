# OVH deployment

Server: `ubuntu@54.37.226.228`. Application directory: `/home/ubuntu/paratunisie`.

- Storefront: https://paratunisie.com
- Administration: https://admin.paratunisie.com/admin
- `www.paratunisie.com` redirects to the storefront.
- Original preview links on the sslip.io hostnames and port 3443 remain available.
- HTTP redirect: http://54.37.226.228:3300

`compose.yml` is copied to `compose.ovh.yml` in the project root on the server,
so build contexts and volume paths resolve from that root. This deployment has
its own Docker network and persistent data volumes, separate from other apps.
The application containers and databases have no published ports; only the
gateway is public. Client API requests use the same origin at `/api/v1`.
The gateway also joins the existing external `usmo_usm-internal` proxy network.

Runtime secrets are in the server's `.env` (mode 0600). Administrator email is
`admin@paratunisie.tn`; its initial password is `SEED_STAFF_PASSWORD` in that file.
The administrator initialization script creates only the staff account and
does not create sample orders or reviews.

Run from the server application directory:

```sh
docker compose -f compose.ovh.yml build paratunisie-api
docker compose -f compose.ovh.yml build paratunisie-web
docker compose -f compose.ovh.yml build paratunisie-admin
docker compose -f compose.ovh.yml up -d
docker compose -f compose.ovh.yml ps
```

Build sequentially to limit memory usage on this shared VPS. Back up the
database before future schema changes. Do not delete persistent volumes.

TLS certificates live in `certbot/`. The `paratunisie-cert.timer` systemd timer
renews them daily using the existing HTTP challenge webroot at
`/var/www/usmo/deploy/certbot/www`, then reloads this project's gateway.
Renewal therefore requires the existing port 80 proxy to remain available.
The real-domain certificate is stored separately in
`/var/www/usmo/deploy/certbot/conf/live/paratunisie.com`. The same timer renews
that certificate and reloads `usm-nginx`, which owns ports 80/443.

The domain route is maintained in `domain-proxy.conf` and installed at
`/var/www/usmo/deploy/nginx/conf.d/paratunisie.conf`. The USMO nginx Dockerfile
copies this extra configuration directory, and its deployed image includes it.
The proxy sends requests to this project's gateway over verified internal TLS.
Keep this additional route when rebuilding or replacing the shared proxy.

Email and SMS use the project's existing SMTP and WinSMS credentials, configured
in the server `.env`. `ADMIN_EMAIL` selects the admin email recipient; SMS is
sent only to the customer. Meta CAPI and AI credentials remain unconfigured.
Notification test and retry endpoints require an authenticated administrator.

## Initial catalogue import

Imported only catalogue records from the user-supplied
`sobitas_db_2026.sql`: 333 published products, with images for 327 products.
The extractor found 386 referenced local media files including brand/category
images. Six products had no matching local photo and use the existing fallback.
No customer, order, review, or legacy staff records were imported.

`extract-sobitas.py` produces catalogue JSON, a media archive, and an import
report without executing the SQL dump. `import-sobitas.cjs` loads that JSON in
a transaction with stable source IDs. Prices are converted from TND to integer
millimes; only unexpired discounts replace the regular price. Stock uses the
source quantities. The importer is for this initial migration; re-running it
will overwrite the imported products' current catalogue values.

The initial migration history was incomplete: the final SEO migration referenced
`Product.publishState` before that column existed. On this new, empty database,
the schema was synchronized with `prisma db push --skip-generate`, then that
migration was marked applied. Future upgrades must use reviewed migrations;
do not use this initial repair procedure blindly on a populated database.
