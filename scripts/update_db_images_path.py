import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('187.53.136.225', port=22, username='root', password='Maleksobitas20@', timeout=10)

sql = """
UPDATE "Article"
SET "featuredImage" = '/assets/blog/' || slug || '.webp',
    "ogImage" = 'https://paratunisie.com/paratunisie-media/blog/' || slug || '.webp'
WHERE slug IS NOT NULL;
"""

cmd = 'docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie'
stdin, stdout, stderr = c.exec_command(cmd)
stdin.write(sql)
stdin.flush()
stdin.channel.shutdown_write()

print("SQL Output:\n", stdout.read().decode('utf-8'))
print("SQL Err:\n", stderr.read().decode('utf-8'))

# Also create symlink in paratunisie-web container so /paratunisie-media works locally too
c.exec_command("docker exec -u 0 paratunisie-web mkdir -p /app/public/paratunisie-media")
c.exec_command("docker exec -u 0 paratunisie-web ln -s /app/public/assets/blog /app/public/paratunisie-media/blog 2>/dev/null || true")

# Restart paratunisie-web so Next.js re-indexes public/
print("Restarting paratunisie-web...")
c.exec_command("docker restart paratunisie-web")

c.close()
print("Done.")
