import paramiko

HOST = "187.53.136.225"
USER = "root"
PASS = "Maleksobitas20@"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, 22, USER, PASS, timeout=15)

def run_sql(label, sql):
    print(f"=== {label} ===")
    stdin, stdout, stderr = ssh.exec_command("docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie")
    stdin.write(sql + "\n")
    stdin.channel.shutdown_write()
    out = stdout.read().decode("utf-8", errors="ignore")
    err = stderr.read().decode("utf-8", errors="ignore")
    if out: print(out)
    if err: print("ERR:", err)

run_sql("All 49 articles", 'SELECT slug, title, category, "featuredImage", "seoTitle", indexable, length(content) as content_len FROM "Article" ORDER BY category, slug;')
run_sql("Target Category SEO", """SELECT slug, name, "seoTitle", length("seoDescription") as desc_len, length("introText") as intro_len, "seoIndexable" FROM "Category" WHERE slug IN ('creatine','whey-proteine','ashwagandha','magnesium','omega-3','vitamines','collagene','probiotiques','pre-workout','complements-alimentaires','mineraux') ORDER BY slug;""")
run_sql("ArticleProduct & ArticleFaq counts", 'SELECT (SELECT count(*) FROM "ArticleProduct") as article_products, (SELECT count(*) FROM "ArticleFaq") as article_faqs;')

ssh.close()
