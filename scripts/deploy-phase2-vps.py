import paramiko
import time

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

def exec_cmd(cmd, cwd=None):
    if cwd:
        full_cmd = f"cd {cwd} && {cmd}"
    else:
        full_cmd = cmd
    print(f"\n>>> Running: {full_cmd}")
    stdin, stdout, stderr = client.exec_command(full_cmd, get_pty=True)
    out = stdout.read().decode("utf-8", errors="replace")
    print(out)
    return out

# 1. Pull Git in /opt/paratunisie/app
exec_cmd("git fetch origin && git reset --hard origin/seo/full-remediation-2026", cwd="/opt/paratunisie/app")

# 2. Safely elevate Wave 1 Products (36 in-stock, locally-imaged products -> indexable=true)
sql_wave1 = """
-- Elevate the 36 high-intent local in-stock products (taking indexable count 14 -> 50)
UPDATE "Product"
SET 
  indexable = true,
  "followLinks" = true,
  "seoQualityScore" = 95,
  "seoReviewedAt" = NOW()
WHERE image LIKE '/uploads/%' AND "inStock" = true;

-- Ensure categories with qualified products are indexable
UPDATE "Category"
SET indexable = true
WHERE slug IN ('accessoires', 'creatine', 'whey-proteine', 'magnesium', 'zinc', 'vitamines', 'ashwagandha', 'omega-3', 'pre-workout', 'bcaa', 'gainers-proteines');
"""

sftp = client.open_sftp()
with sftp.file('/tmp/apply_wave1.sql', 'w') as f:
    f.write(sql_wave1)
sftp.close()

exec_cmd("docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie < /tmp/apply_wave1.sql")

# 3. Rebuild Next.js Web and API Containers using docker-compose.prod.yml
exec_cmd("docker compose -f docker-compose.prod.yml build web api", cwd="/opt/paratunisie/app")
exec_cmd("docker compose -f docker-compose.prod.yml up -d web api", cwd="/opt/paratunisie/app")

print("\nWaiting 15s for containers to stabilize...")
time.sleep(15)

# 4. Check docker ps
exec_cmd("docker compose -f docker-compose.prod.yml ps", cwd="/opt/paratunisie/app")

client.close()
