import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

sftp = client.open_sftp()
with sftp.file('/tmp/inspect_articles.sql', 'w') as f:
    f.write("""
SELECT id, title, slug, category, "focusKeyword", indexable, "publishedAt"
FROM "Article"
ORDER BY id;
""")
sftp.close()

stdin, stdout, stderr = client.exec_command("docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie < /tmp/inspect_articles.sql")
print(stdout.read().decode("utf-8", errors="replace"))

client.close()
