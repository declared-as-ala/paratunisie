import paramiko

WAVE1_SLUGS = [
    "whey-sans-lactose-tunisie",
    "whey-native-vs-fromagere-tunisie",
    "creatine-creapure-tunisie-ou-acheter",
    "creatine-prise-de-masse-seche-tunisie",
    "gainer-sans-gras-prise-de-masse-seche-tunisie",
    "gainer-maison-naturel-flocons-avoine-tunisie",
    "vitamine-d3-k2-synergie-musculation-tunisie",
    "zinc-magnesium-b6-recuperation-testosterone-tunisie",
    "ashwagandha-ksm-66-vs-sensoril-difference",
    "sommeil-anabolisme-croissance-musculaire-tunisie",
    "citrulline-malate-dosage-effet-tunisie",
    "beta-alanine-picotements-endurance-tunisie",
    "l-carnitine-cardio-a-jeun-tunisie",
    "authentique-vs-contrefacon-complements-tunisie",
    "budget-mensuel-supplements-musculation-tunisie"
]

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('187.53.136.225', port=22, username='root', password='Maleksobitas20@', timeout=10)

def run_sql(sql):
    cmd = 'docker exec -i paratunisie-postgres psql -U paratunisie -d paratunisie'
    stdin, stdout, stderr = client.exec_command(cmd)
    stdin.write(sql)
    stdin.flush()
    stdin.channel.shutdown_write()
    out = stdout.read().decode('utf-8')
    err = stderr.read().decode('utf-8')
    return out, err

slugs_str = ", ".join([f"'{s}'" for s in WAVE1_SLUGS])
update_sql = f"""
UPDATE "Article"
SET status = 'PUBLISHED', "publishedAt" = NOW(), indexable = true
WHERE slug IN ({slugs_str});
SELECT status, COUNT(*) FROM "Article" GROUP BY status;
"""

out, err = run_sql(update_sql)
print("Output:\n", out)
if err:
    print("Err:\n", err)

client.close()
