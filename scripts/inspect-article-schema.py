import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('187.53.136.225', port=22, username='root', password='Maleksobitas20@', timeout=10)

def query(sql):
    cmd = f'docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "{sql}"'
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace')

print("--- ArticleProduct ---")
print(query("\\d \\\"ArticleProduct\\\""))

print("--- ArticleFaq ---")
print(query("\\d \\\"ArticleFaq\\\""))

print("--- Article ---")
print(query("\\d \\\"Article\\\""))

client.close()
