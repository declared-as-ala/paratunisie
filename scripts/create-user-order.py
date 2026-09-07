import paramiko
import json

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("145.223.118.9", port=22, username="root", password="3)'qklBH#Dtv'xY2", timeout=15)

def run_cmd(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8')
    err = stderr.read().decode('utf-8')
    if out:
        print(out)
    if err:
        print("[STDERR]", err)
    return out, err

payload = {
    "firstName": "Slim",
    "lastName": "Allani",
    "phone": "27369150",
    "gouvernorat": "Ariana",
    "fullAddress": "Ariana près de California Gym Centre Urbain Nord",
    "items": [
        {
            "productId": "c1a04de23d7f0gd087bqghsn",
            "productVariantId": "c1a04de23d7fxso6oqpolqlq",
            "quantity": 1,
            "priceMillimes": 119000
        }
    ]
}

payload_json = json.dumps(payload).replace("'", "'\\''")

cmd = f"""
curl -s -X POST http://127.0.0.1:3013/api/v1/orders \\
  -H "Content-Type: application/json" \\
  -d '{payload_json}'
"""

print("Executing order creation on port 3013...")
run_cmd(cmd)

client.close()
