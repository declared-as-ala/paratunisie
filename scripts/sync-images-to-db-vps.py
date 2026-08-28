import paramiko

VPS_HOST = "145.223.118.9"
VPS_PORT = 22
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

cmd = '''docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie << 'EOF'
UPDATE "Article" SET
  "featuredImage" = '/assets/blog/' || slug || '.webp',
  "ogImage" = 'https://paratunisie.com/assets/blog/' || slug || '.webp'
WHERE slug IS NOT NULL;
EOF
'''
stdin, stdout, stderr = client.exec_command(cmd)
print("STDOUT:", stdout.read().decode('utf-8', errors='ignore'))
print("STDERR:", stderr.read().decode('utf-8', errors='ignore'))

# Verify
check_cmd = 'docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie -c \'SELECT slug, "featuredImage" FROM "Article" LIMIT 5;\''
stdin, stdout, stderr = client.exec_command(check_cmd)
print("\nSample records in DB:\n", stdout.read().decode('utf-8', errors='ignore'))

client.close()
