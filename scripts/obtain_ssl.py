import paramiko

HOST = "187.53.136.225"
USER = "root"
PASS = "Maleksobitas20@"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, 22, USER, PASS, timeout=30)

def run(cmd):
    print(f"=== {cmd} ===")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out: print(out)
    if err: print("STDERR:", err)

# Remove the broken symlink first so nginx can reload
run("rm -f /etc/nginx/sites-enabled/paratunisie-domains.conf")
run("nginx -t")
run("systemctl reload nginx")

# Create temporary HTTP-only config for certbot challenge
http_only_conf = """server {
    listen 80;
    listen [::]:80;
    server_name paratunisie.com www.paratunisie.com admin.paratunisie.com;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 200 'OK';
    }
}
"""

stdin, stdout, stderr = ssh.exec_command('cat > /etc/nginx/sites-available/paratunisie-http.conf')
stdin.write(http_only_conf)
stdin.channel.shutdown_write()

run("ln -sf /etc/nginx/sites-available/paratunisie-http.conf /etc/nginx/sites-enabled/paratunisie-http.conf")
run("mkdir -p /var/www/html")
run("nginx -t")
run("systemctl reload nginx")

# Run certbot
run("certbot certonly --webroot -w /var/www/html -d paratunisie.com -d www.paratunisie.com -d admin.paratunisie.com --non-interactive --agree-tos --register-unsafely-without-email")

ssh.close()

