# -*- coding: utf-8 -*-
import os
import json
import urllib.request
import paramiko

VPS_HOST = "187.53.136.225"
VPS_PORT = 22
VPS_USER = "root"
VPS_PASS = "Maleksobitas20@"

SIX_SLUGS = [
    ("zinc-picolinate-vs-bisglycinate", "photo-1584308666744-24d5c474f2ae"),
    ("huile-de-foie-de-morue-bienfaits-sport-sante", "photo-1607613009820-a29f7bb81c04"),
    ("coenzyme-q10-ubiquinone-coeur-energie", "photo-1550572017-ed200f5e6343"),
    ("gaba-acide-gamma-aminobutyrique-relaxation", "photo-1541781774459-bb2af2f05b55"),
    ("electrolytes-boisson-effort-chaleur-tunisie", "photo-1517838277536-f5f99be501cd"),
    ("authentique-vs-contrefacon-complements-tunisie", "photo-1584308666744-24d5c474f2ae")
]

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

vps_fix_script = f"""
import os
import datetime
import hashlib
import hmac
import urllib.request

slugs = {json.dumps(SIX_SLUGS)}

access_key = "paratunisie_admin"
secret_key = "9fbe43ecc235b3c65463770350058fc3"
bucket = "paratunisie-media"
region = "us-east-1"
service = "s3"

def sign(key, msg):
    return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()

def upload_minio(content, object_key):
    content_type = "image/webp"
    now = datetime.datetime.now(datetime.timezone.utc)
    amz_date = now.strftime("%Y%m%dT%H%M%SZ")
    date_stamp = now.strftime("%Y%m%d")

    payload_hash = hashlib.sha256(content).hexdigest()
    canonical_uri = f"/{{bucket}}/{{object_key}}"
    canonical_headers = f"content-type:{{content_type}}\\nhost:127.0.0.1:9000\\nx-amz-content-sha256:{{payload_hash}}\\nx-amz-date:{{amz_date}}\\n"
    signed_headers = "content-type;host;x-amz-content-sha256;x-amz-date"
    canonical_request = f"PUT\\n{{canonical_uri}}\\n\\n{{canonical_headers}}\\n{{signed_headers}}\\n{{payload_hash}}"

    algorithm = "AWS4-HMAC-SHA256"
    credential_scope = f"{{date_stamp}}/{{region}}/{{service}}/aws4_request"
    string_to_sign = f"{{algorithm}}\\n{{amz_date}}\\n{{credential_scope}}\\n{{hashlib.sha256(canonical_request.encode('utf-8')).hexdigest()}}"

    k_date = sign(("AWS4" + secret_key).encode("utf-8"), date_stamp)
    k_region = sign(k_date, region)
    k_service = sign(k_region, service)
    k_signing = sign(k_service, "aws4_request")
    signature = hmac.new(k_signing, string_to_sign.encode("utf-8"), hashlib.sha256).hexdigest()

    auth_header = f"{{algorithm}} Credential={{access_key}}/{{credential_scope}}, SignedHeaders={{signed_headers}}, Signature={{signature}}"

    headers = {{
        "Host": "127.0.0.1:9000",
        "Content-Type": content_type,
        "x-amz-date": amz_date,
        "x-amz-content-sha256": payload_hash,
        "Authorization": auth_header
    }}

    req = urllib.request.Request(f"http://127.0.0.1:9000/{{bucket}}/{{object_key}}", data=content, headers=headers, method="PUT")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.status

for slug, pid in slugs:
    url = f"https://images.unsplash.com/{{pid}}?w=1200&h=630&fit=crop&q=85&fm=webp"
    try:
        req = urllib.request.Request(url, headers={{"User-Agent": "Mozilla/5.0"}})
        with urllib.request.urlopen(req, timeout=15) as r:
            img_data = r.read()
        st = upload_minio(img_data, f"blog/{{slug}}.webp")
        print(f"Fixed {{slug}} -> HTTP {{st}}")
    except Exception as e:
        print(f"Error on {{slug}}: {{e}}")

# Direct copy from MinIO storage directory on host into paratunisie-web container
os.system("docker cp paratunisie-minio:/data/paratunisie-media/blog/. paratunisie-web:/app/public/assets/blog/")
os.system("docker exec -u 0 paratunisie-web chmod 644 /app/public/assets/blog/*.webp")
print("Synced all MinIO blog images into Next.js container.")
"""

print("Executing fix for 6 images and syncing with Next.js container...")
sftp = client.open_sftp()
with sftp.file("/tmp/fix_6.py", "w") as f:
    f.write(vps_fix_script)
sftp.close()

stdin, stdout, stderr = client.exec_command("python3 /tmp/fix_6.py && rm /tmp/fix_6.py")
for line in stdout:
    print("VPS:", line.strip())

# Count MinIO blog objects
stdin, stdout, _ = client.exec_command("docker exec paratunisie-minio ls -1 /data/paratunisie-media/blog | wc -l")
print("Total images in MinIO /data/paratunisie-media/blog:", stdout.read().decode('utf-8').strip())

# Count Next.js blog images
stdin, stdout, _ = client.exec_command("docker exec paratunisie-web ls -1 /app/public/assets/blog | wc -l")
print("Total images in Next.js /app/public/assets/blog:", stdout.read().decode('utf-8').strip())

client.close()
