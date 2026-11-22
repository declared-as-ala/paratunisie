import paramiko

HOST = "187.53.136.225"
USER = "root"
PASS = "Maleksobitas20@"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, 22, USER, PASS, timeout=15)

queries = [
    ("Tables", "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;"),
    ("Article status counts", 'SELECT status, count(*) FROM "Article" GROUP BY status;'),
    ("Article categories", 'SELECT category, status, count(*) FROM "Article" GROUP BY category, status ORDER BY count(*) DESC;'),
    ("Category list", 'SELECT id, slug, name FROM "Category" ORDER BY name;'),
    ("Product count", 'SELECT count(*) FROM "Product";'),
    ("Sample articles", 'SELECT slug, title, status, "coverImage" FROM "Article" LIMIT 15;'),
]

for label, q in queries:
    cmd = f"docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -c {repr(q)}"
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode("utf-8", errors="ignore")
    err = stderr.read().decode("utf-8", errors="ignore")
    print(f"=== {label} ===")
    if out: print(out)
    if err: print("ERR:", err)

ssh.close()
