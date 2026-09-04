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

script = """
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function run() {
  const hash = await bcrypt.hash('ParaTunisie2026!', 10);
  const staff = await prisma.staffUser.upsert({
    where: { email: 'admin@paratunisie.tn' },
    update: { passwordHash: hash, isActive: true },
    create: { email: 'admin@paratunisie.tn', passwordHash: hash, name: 'Admin ParaTunisie', role: 'SUPER_ADMIN', isActive: true }
  });
  console.log('Admin account ready: ' + staff.email);
}
run().catch(console.error);
"""

sftp = client.open_sftp()
with sftp.open("/tmp/verify_admin.js", "w") as f:
    f.write(script)
sftp.close()

stdin, stdout, stderr = client.exec_command("docker exec -i paratunisie-api node /tmp/verify_admin.js")
print(stdout.read().decode())

client.close()
