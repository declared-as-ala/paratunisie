import psycopg2

try:
    conn = psycopg2.connect('postgresql://postgres:postgres@localhost:5433/paratunisie')
    cur = conn.cursor()
    cur.execute("""
        SELECT id, name, brand, slug, price_millimes, regular_price_millimes, image, in_stock
        FROM products 
        WHERE name ILIKE '%ashwagandha%' OR name ILIKE '%magn%' OR name ILIKE '%sommeil%' OR name ILIKE '%relax%'
        LIMIT 15;
    """)
    rows = cur.fetchall()
    for r in rows:
        print(r)
    conn.close()
except Exception as e:
    print("Error:", e)
