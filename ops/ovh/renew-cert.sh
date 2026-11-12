#!/bin/sh
set -eu
docker run --rm -v /home/ubuntu/paratunisie/certbot:/etc/letsencrypt -v /var/www/usmo/deploy/certbot/www:/var/www/certbot certbot/certbot renew --quiet --no-random-sleep-on-renew
docker exec paratunisie-gateway nginx -s reload
docker run --rm -v /var/www/usmo/deploy/certbot/conf:/etc/letsencrypt -v /var/www/usmo/deploy/certbot/www:/var/www/certbot certbot/certbot renew --cert-name paratunisie.com --quiet --no-random-sleep-on-renew
docker exec usm-nginx nginx -s reload
