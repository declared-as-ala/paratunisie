import paramiko

ip = "187.53.136.225"
user = "root"
password = "Maleksobitas20@"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(ip, port=22, username=user, password=password, timeout=10)

def run_cmd(cmd):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

sql = """
SELECT id, slug, name, indexable, status, "seoTitle", "canonicalUrl",
       (SELECT COUNT(*) FROM "Product" p WHERE p."categoryId" = c.id) as product_count
FROM "Category" c
ORDER BY product_count DESC;
"""

cmd = f'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c \'{sql}\''
out, _ = run_cmd(cmd)
print("=== ALL CATEGORIES IN DB ===")
print(out)

# Check redirects table if exists
sql_redirects = """
SELECT COUNT(*) FROM "Redirect" 2>/dev/null;
"""
cmd_red = f'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c \'{sql_redirects}\''
out_red, err_red = run_cmd(cmd_red)
print("=== REDIRECTS COUNT ===")
print(out_red if not err_red else f"No Redirect table or error: {err_red}")

client.close()
