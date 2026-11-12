import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.53.136.225', 22, 'root', 'Maleksobitas20@', timeout=10)

stdin, stdout, stderr = ssh.exec_command('curl -s https://paratunisie.com/ | grep -o "hero-split-4"')
print("Live hero on https://paratunisie.com/:", stdout.read().decode('utf-8', errors='replace').strip())

stdin, stdout, stderr = ssh.exec_command('curl -s https://paratunisie.com/ | grep -o "CRÉATINE"')
print("Live CRÉATINE on https://paratunisie.com/:", stdout.read().decode('utf-8', errors='replace').strip())

stdin, stdout, stderr = ssh.exec_command('curl -s https://paratunisie.com/ | grep -o "WHEY PROTÉINE"')
print("Live WHEY PROTÉINE on https://paratunisie.com/:", stdout.read().decode('utf-8', errors='replace').strip())

stdin, stdout, stderr = ssh.exec_command('curl -s https://paratunisie.com/ | grep -o "MASS GAINER"')
print("Live MASS GAINER on https://paratunisie.com/:", stdout.read().decode('utf-8', errors='replace').strip())

stdin, stdout, stderr = ssh.exec_command('curl -s https://paratunisie.com/ | grep -o "VITAMINES &amp; ASHWAGANDHA"')
print("Live VITAMINES & ASHWAGANDHA on https://paratunisie.com/:", stdout.read().decode('utf-8', errors='replace').strip())

stdin, stdout, stderr = ssh.exec_command('curl -s https://paratunisie.com/ | grep -o "Aramex Express Tunisie"')
print("Live Footer Aramex on https://paratunisie.com/:", stdout.read().decode('utf-8', errors='replace').strip())

ssh.close()
