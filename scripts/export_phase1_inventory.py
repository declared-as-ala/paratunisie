import paramiko
import json

HOST = "187.53.136.225"
USER = "root"
PASS = "Maleksobitas20@"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, 22, USER, PASS, timeout=15)

def query_json(sql):
    wrapped = f"SELECT coalesce(json_agg(t), '[]'::json) FROM ({sql}) t;"
    stdin, stdout, stderr = ssh.exec_command("docker exec -i paratunisie-postgres psql -t -A -U paratunisie -d paratunisie")
    stdin.write(wrapped + "\n")
    stdin.channel.shutdown_write()
    out = stdout.read().decode("utf-8", errors="ignore").strip()
    err = stderr.read().decode("utf-8", errors="ignore").strip()
    if err:
        print("SQL ERR:", err)
    return json.loads(out) if out else []

cat_cols = query_json("SELECT column_name FROM information_schema.columns WHERE table_name='Category' ORDER BY ordinal_position")
prod_cols = query_json("SELECT column_name FROM information_schema.columns WHERE table_name='Product' ORDER BY ordinal_position")
print("Category cols:", [c["column_name"] for c in cat_cols])
print("Product cols:", [c["column_name"] for c in prod_cols])

categories = query_json("""SELECT id, slug, name, "seoTitle", "seoDescription", "seoIntro", indexable FROM "Category" WHERE slug IN ('creatine','whey-proteine','whey-isolate','ashwagandha','magnesium','omega-3','vitamines','mineraux','collagene','articulations','probiotiques','digestion','pre-workout','complements-alimentaires','sommeil-stress') ORDER BY slug""")

products_sample = query_json("""
    SELECT p.id, p.slug, p.name, p.image, pv."priceMillimes", pv.stock, c.slug as category_slug
    FROM "Product" p
    JOIN "Category" c ON p."categoryId" = c.id
    LEFT JOIN "ProductVariant" pv ON pv."productId" = p.id
    WHERE c.slug IN ('creatine','whey-proteine','whey-isolate','ashwagandha','magnesium','omega-3','vitamines','mineraux','collagene','articulations','probiotiques','digestion','pre-workout','complements-alimentaires','sommeil-stress')
      AND p.indexable = true
    ORDER BY c.slug, COALESCE(pv.stock, 0) DESC, p.name
""")

ssh.close()

prod_by_cat = {}
seen_prod = set()
for p in products_sample:
    if p["slug"] in seen_prod:
        continue
    seen_prod.add(p["slug"])
    prod_by_cat.setdefault(p["category_slug"], []).append(p)

prod_top = {k: v[:10] for k, v in prod_by_cat.items()}

with open("scripts/phase1_audit_inventory.json", "r", encoding="utf-8") as f:
    inv = json.load(f)

inv["target_categories"] = categories
inv["top_products_by_category"] = prod_top

with open("scripts/phase1_audit_inventory.json", "w", encoding="utf-8") as f:
    json.dump(inv, f, ensure_ascii=False, indent=2)

print(f"\nUpdated inventory: {len(categories)} categories:")
for c in categories:
    print(f"  /{c['slug']} | {c['name']} | indexable={c['indexable']} | seoTitle={c['seoTitle']} | intro_len={len(c.get('seoIntro') or '')}")
print("Products per cat:", {k: len(v) for k, v in prod_top.items()})
