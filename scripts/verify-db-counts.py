import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.223.118.9', port=22, username='root', password='3)\'qklBH#Dtv\'xY2')

count_sql = """
SELECT 'Product Total' as metric, count(*) FROM "Product"
UNION ALL SELECT 'Product IN_STOCK (En Stock)', count(*) FROM "Product" WHERE "inStock" = true
UNION ALL SELECT 'Product SUR_COMMANDE (Sur Commande)', count(*) FROM "Product" WHERE "inStock" = false
UNION ALL SELECT 'Brands Total', count(*) FROM "Brand"
UNION ALL SELECT 'Categories Total', count(*) FROM "Category"
UNION ALL SELECT 'ProductVariants Total', count(*) FROM "ProductVariant"
UNION ALL SELECT 'Orders (Preserved)', count(*) FROM "Order"
UNION ALL SELECT 'Reviews (Preserved)', count(*) FROM "Review"
UNION ALL SELECT 'Users (Preserved)', count(*) FROM "User";
"""

stdin, stdout, stderr = client.exec_command('docker exec paratunisie-postgres psql -U paratunisie -d paratunisie -c "SELECT \'Product Total\' as metric, count(*) FROM \\"Product\\" UNION ALL SELECT \'Product IN_STOCK (En Stock)\', count(*) FROM \\"Product\\" WHERE \\"inStock\\" = true UNION ALL SELECT \'Product SUR_COMMANDE (Sur Commande)\', count(*) FROM \\"Product\\" WHERE \\"inStock\\" = false UNION ALL SELECT \'Brands Total\', count(*) FROM \\"Brand\\" UNION ALL SELECT \'Categories Total\', count(*) FROM \\"Category\\" UNION ALL SELECT \'ProductVariants Total\', count(*) FROM \\"ProductVariant\\" UNION ALL SELECT \'Orders (Preserved)\', count(*) FROM \\"Order\\" UNION ALL SELECT \'Reviews (Preserved)\', count(*) FROM \\"Review\\" UNION ALL SELECT \'Users (Preserved)\', count(*) FROM \\"User\\";"')
print(stdout.read().decode('utf-8'))
client.close()
