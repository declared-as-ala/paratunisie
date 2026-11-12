import paramiko

ip = "187.53.136.225"
user = "root"
password = "Maleksobitas20@"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(ip, port=22, username=user, password=password, timeout=10)

def run_cmd(cmd):
    print(f"\n>>> {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out.strip():
        print(out.strip())
    if err.strip():
        print("STDERR:", err.strip())
    return out, err

# 1. Backup current nginx config
run_cmd("cp /etc/nginx/sites-available/paratunisie-domains.conf /etc/nginx/sites-available/paratunisie-domains.conf.bak-seo-fix")

# 2. Write new nginx configuration
new_nginx_config = """# Nginx Configuration for ParaTunisie
# Strict canonical domain: https://paratunisie.com
# Permanent 301 redirects from HTTP and www.paratunisie.com

# ── 1. HTTP Redirect (Port 80 -> HTTPS Canonical) ──────────────────────────
server {
    listen 80;
    listen [::]:80;
    server_name paratunisie.com www.paratunisie.com;
    return 301 https://paratunisie.com$request_uri;
}

# ── 2. HTTPS WWW Redirect (Port 443 www -> HTTPS Canonical) ────────────────
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name www.paratunisie.com;

    ssl_certificate /etc/letsencrypt/live/paratunisie.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/paratunisie.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://paratunisie.com$request_uri;
}

# ── 3. HTTPS Canonical Storefront & API (Port 443) ─────────────────────────
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name paratunisie.com;

    ssl_certificate /etc/letsencrypt/live/paratunisie.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/paratunisie.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location /api {
        proxy_pass http://127.0.0.1:3013;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads {
        proxy_pass http://127.0.0.1:3013;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /paratunisie-media {
        proxy_pass http://127.0.0.1:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $http_connection;
        proxy_http_version 1.1;
    }
}

# ── 4. Admin HTTP Redirect ────────────────────────────────────────────────
server {
    listen 80;
    listen [::]:80;
    server_name admin.paratunisie.com;
    return 301 https://admin.paratunisie.com$request_uri;
}

# ── 5. Admin HTTPS ────────────────────────────────────────────────────────
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name admin.paratunisie.com;

    ssl_certificate /etc/letsencrypt/live/paratunisie.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/paratunisie.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:3014;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $http_connection;
        proxy_http_version 1.1;
    }
}
"""

stdin, stdout, stderr = client.exec_command('cat > /etc/nginx/sites-available/paratunisie-domains.conf', timeout=15)
stdin.write(new_nginx_config)
stdin.channel.shutdown_write()

# 3. Test nginx configuration
out, err = run_cmd("nginx -t")

if "successful" in out or "successful" in err:
    print("\nNginx syntax test passed! Reloading Nginx...")
    run_cmd("systemctl reload nginx")
    print("Nginx reloaded successfully!")
else:
    print("\nNginx syntax test failed! Reverting to backup...")
    run_cmd("cp /etc/nginx/sites-available/paratunisie-domains.conf.bak-seo-fix /etc/nginx/sites-available/paratunisie-domains.conf")
    run_cmd("systemctl reload nginx")

# 4. Verify redirects with curl
run_cmd("curl -k -I -m 5 https://www.paratunisie.com/ | head -n 10")
run_cmd("curl -k -I -m 5 http://www.paratunisie.com/ | head -n 10")
run_cmd("curl -k -I -m 5 https://paratunisie.com/ | head -n 10")

client.close()
