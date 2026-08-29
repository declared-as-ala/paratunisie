import paramiko
import os
import datetime

timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
backup_filename = f"paratunisie_backup_{timestamp}.sql"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("145.223.118.9", port=22, username="root", password="3)'qklBH#Dtv'xY2", timeout=15)

def run_cmd(cmd):
    print(f"=== RUNNING: {cmd} ===")
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8')
    err = stderr.read().decode('utf-8')
    if out:
        print(out)
    if err:
        print("[STDERR]", err)
    return out, err

# Create backup directory on VPS
run_cmd("mkdir -p /opt/paratunisie/backups")

# Run pg_dump from postgres container
dump_cmd = f"docker exec paratunisie-postgres pg_dump -U paratunisie -d paratunisie > /opt/paratunisie/backups/{backup_filename}"
run_cmd(dump_cmd)

# Verify backup size on VPS
run_cmd(f"ls -lh /opt/paratunisie/backups/{backup_filename}")

# Download backup locally
os.makedirs("backups", exist_ok=True)
local_dest = os.path.join("backups", backup_filename)

sftp = client.open_sftp()
sftp.get(f"/opt/paratunisie/backups/{backup_filename}", local_dest)
sftp.close()

print(f"✓ Backup downloaded locally to: {local_dest} ({os.path.getsize(local_dest)} bytes)")
client.close()
