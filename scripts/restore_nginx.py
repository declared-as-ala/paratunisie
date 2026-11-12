import paramiko

HOST = "187.53.136.225"
USER = "root"
PASS = "Maleksobitas20@"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, 22, USER, PASS, timeout=15)

def run(cmd):
    print(f"=== {cmd} ===")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out: print(out)
    if err: print("STDERR:", err)

nginx_conf = """# Nginx Configuration for ParaTunisie
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

stdin, stdout, stderr = ssh.exec_command('cat > /etc/nginx/sites-available/paratunisie-domains.conf')
stdin.write(nginx_conf)
stdin.channel.shutdown_write()

run("ln -sf /etc/nginx/sites-available/paratunisie-domains.conf /etc/nginx/sites-enabled/paratunisie-domains.conf")
run("nginx -t")
run("systemctl reload nginx")

ssh.close()
print("Nginx configured and reloaded!")

