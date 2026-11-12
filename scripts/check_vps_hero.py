import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

stdin, stdout, stderr = ssh.exec_command('head -n 25 /root/paratunisie/src/components/home/home-hero.tsx')
print("=== VPS home-hero.tsx ===")
print(stdout.read().decode('utf-8', errors='replace'))

stdin, stdout, stderr = ssh.exec_command('docker exec paratunisie-web head -n 25 /app/src/components/home/home-hero.tsx 2>/dev/null || echo "not in /app/src"')
print("=== Container home-hero.tsx ===")
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
