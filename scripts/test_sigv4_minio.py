import hmac
import hashlib
import datetime
import urllib.request
import paramiko

# Test AWS SigV4 directly on VPS
vps_script = """
import hmac
import hashlib
import datetime
import urllib.request

access_key = 'paratunisie_admin'
secret_key = '9fbe43ecc235b3c65463770350058fc3'
bucket = 'paratunisie-media'
object_key = 'blog/test_v4.txt'
content = b'Hello from SigV4 to MinIO!'
content_type = 'text/plain'

now = datetime.datetime.utcnow()
amz_date = now.strftime('%Y%m%dT%H%M%SZ')
date_stamp = now.strftime('%Y%m%d')
region = 'us-east-1'
service = 's3'

payload_hash = hashlib.sha256(content).hexdigest()

canonical_uri = f'/{bucket}/{object_key}'
canonical_querystring = ''
canonical_headers = f'content-type:{content_type}\\nhost:127.0.0.1:9000\\nx-amz-content-sha256:{payload_hash}\\nx-amz-date:{amz_date}\\n'
signed_headers = 'content-type;host;x-amz-content-sha256;x-amz-date'

canonical_request = f'PUT\\n{canonical_uri}\\n{canonical_querystring}\\n{canonical_headers}\\n{signed_headers}\\n{payload_hash}'

algorithm = 'AWS4-HMAC-SHA256'
credential_scope = f'{date_stamp}/{region}/{service}/aws4_request'
string_to_sign = f'{algorithm}\\n{amz_date}\\n{credential_scope}\\n{hashlib.sha256(canonical_request.encode("utf-8")).hexdigest()}'

def sign(key, msg):
    return hmac.new(key, msg.encode('utf-8'), hashlib.sha256).digest()

k_date = sign(('AWS4' + secret_key).encode('utf-8'), date_stamp)
k_region = sign(k_date, region)
k_service = sign(k_region, service)
k_signing = sign(k_service, 'aws4_request')
signature = hmac.new(k_signing, string_to_sign.encode('utf-8'), hashlib.sha256).hexdigest()

authorization_header = f'{algorithm} Credential={access_key}/{credential_scope}, SignedHeaders={signed_headers}, Signature={signature}'

headers = {
    'Host': '127.0.0.1:9000',
    'Content-Type': content_type,
    'x-amz-date': amz_date,
    'x-amz-content-sha256': payload_hash,
    'Authorization': authorization_header
}

req = urllib.request.Request(f'http://127.0.0.1:9000/{bucket}/{object_key}', data=content, headers=headers, method='PUT')
try:
    with urllib.request.urlopen(req) as resp:
        print('Upload status:', resp.status)
except Exception as e:
    print('Upload error:', e)
"""

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('187.53.136.225', port=22, username='root', password='Maleksobitas20@', timeout=10)

stdin, stdout, stderr = c.exec_command('python3 -')
stdin.write(vps_script)
stdin.flush()
stdin.channel.shutdown_write()

print("STDOUT:\n", stdout.read().decode('utf-8'))
print("STDERR:\n", stderr.read().decode('utf-8'))

# Now test public curl
_, out_curl, _ = c.exec_command('curl -i -s https://paratunisie.com/paratunisie-media/blog/test_v4.txt')
print("Public curl result:\n", out_curl.read().decode('utf-8')[:300])

c.close()
