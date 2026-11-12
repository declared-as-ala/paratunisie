import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('187.53.136.225', port=22, username='root', password='Maleksobitas20@', timeout=10)

# Check user and permissions of container
cmd = "docker exec paratunisie-web whoami"
_, out, _ = client.exec_command(cmd)
print("Container user:", out.read().decode('utf-8').strip())

# Check folder perms
cmd = "docker exec -u 0 paratunisie-web ls -ld public/assets/blog"
_, out, _ = client.exec_command(cmd)
print("Folder perms:", out.read().decode('utf-8').strip())

# Now extract tar with -u 0 (root) into public/assets/blog and fix ownership
cmd = "docker cp /tmp/blog_100_images.tar paratunisie-web:/tmp/blog_100_images.tar && " \
      "docker exec -u 0 paratunisie-web tar -xf /tmp/blog_100_images.tar -C public/assets/blog/ && " \
      "docker exec -u 0 paratunisie-web chmod 644 public/assets/blog/*.webp && " \
      "docker exec -u 0 paratunisie-web rm /tmp/blog_100_images.tar"

_, out, err = client.exec_command(cmd)
print("Extract err/out:", err.read().decode('utf-8'))

# Check count
cmd = "docker exec paratunisie-web sh -c 'ls -1 public/assets/blog | wc -l'"
_, out, _ = client.exec_command(cmd)
print("Total images in public/assets/blog:", out.read().decode('utf-8').strip())

# Test one image via curl over localhost:3010
cmd = "curl -I http://localhost:3010/assets/blog/whey-sans-lactose-tunisie.webp"
_, out, _ = client.exec_command(cmd)
print("\nCurl test for new blog image:\n", out.read().decode('utf-8').strip())

client.close()
