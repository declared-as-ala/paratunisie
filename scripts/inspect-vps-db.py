import paramiko

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

# Query counts of Product, Brand, Category, Order, Review, User, ImportedProduct
cmd = """
docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "
SELECT 'Product' as table_name, count(*) FROM \\"Product\\"
UNION ALL SELECT 'Brand', count(*) FROM \\"Brand\\"
UNION ALL SELECT 'Category', count(*) FROM \\"Category\\"
UNION ALL SELECT 'ProductVariant', count(*) FROM \\"ProductVariant\\"
UNION ALL SELECT 'Order', count(*) FROM \\"Order\\"
UNION ALL SELECT 'Review', count(*) FROM \\"Review\\"
UNION ALL SELECT 'User', count(*) FROM \\"User\\"
UNION ALL SELECT 'Article', count(*) FROM \\"Article\\"
UNION ALL SELECT 'ImportedProduct', count(*) FROM \\"ImportedProduct\\";
"
"""
run_cmd(cmd)
client.close()
