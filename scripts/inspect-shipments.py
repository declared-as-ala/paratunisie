import os
from dotenv import load_dotenv
import psycopg2
import psycopg2.extras

load_dotenv('apps/api/.env')
db_url = os.environ.get('DATABASE_URL').split('?')[0]
conn = psycopg2.connect(db_url)
cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

cur.execute('SELECT id, "orderId", hawb, tracking, status, "lastTrackingUpdate", "labelUrl" FROM "Shipment";')
rows = cur.fetchall()
print(f'SHIPMENTS IN DB ({len(rows)}):')
for r in rows:
    print(r)

cur.execute('SELECT id, status, "totalMillimes", "createdAt" FROM "Order" ORDER BY "createdAt" DESC LIMIT 10;')
orders = cur.fetchall()
print(f'\nRECENT ORDERS ({len(orders)}):')
for o in orders:
    print(o)
