import sys
import paramiko

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

def run(cmd):
    print("=" * 60)
    print(f"COMMAND: {cmd}")
    print("=" * 60)
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    print(out)
    if err: print("[STDERR]", err)
    return out

node_cmd = """
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const articles = await prisma.article.findMany({
    include: {
      products: true,
      brands: true,
      concerns: true,
      faqs: true,
    }
  });
  console.log('CURRENT DB ARTICLES COUNT:', articles.length);
  console.log(JSON.stringify(articles, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
"""

stdin, stdout, stderr = client.exec_command("docker exec -i paratunisie-api node -e \"" + node_cmd.replace('"', '\\"') + "\"")
out = stdout.read().decode(errors="replace")
err = stderr.read().decode(errors="replace")
print("OUTPUT:", out)
if err: print("STDERR:", err)

client.close()
