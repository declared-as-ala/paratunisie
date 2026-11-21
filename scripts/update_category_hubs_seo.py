# -*- coding: utf-8 -*-
"""
Phase 8: Ensure target commercial category hubs have indexable=true (for hubs with live products)
and strong seoDescription / seoIntro without breaking existing curated category copy.
"""
import paramiko

VPS_HOST = "187.53.136.225"
VPS_USER = "root"
VPS_PASS = "Maleksobitas20@"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(VPS_HOST, 22, VPS_USER, VPS_PASS, timeout=20)

sql = """
BEGIN;
UPDATE "Category"
SET indexable = true,
    "seoIntro" = COALESCE(NULLIF("seoIntro", ''), 'Découvrez notre sélection de probiotiques et formules pour le confort digestif disponibles en Tunisie : souches identifiées, gélules gastro-résistantes et marques certifiées.'),
    "seoDescription" = COALESCE(NULLIF("seoDescription", ''), 'Probiotiques en Tunisie : souches documentées, UFC garanties, formats gastro-résistants et livraison rapide 24-48h sur ParaTunisie.')
WHERE slug = 'probiotiques';

UPDATE "Category"
SET indexable = true,
    "seoIntro" = 'Comparez nos minéraux et oligo-éléments essentiels en Tunisie : magnésium bisglycinate, zinc, fer bisglycinate, calcium et complexes bien dosés avec livraison 24-48h.',
    "seoDescription" = 'Minéraux en Tunisie : magnésium, zinc, fer bisglycinate et calcium de marques certifiées. Comparez les formes et commandez sur ParaTunisie.'
WHERE slug = 'mineraux';
COMMIT;
"""

stdin, stdout, stderr = ssh.exec_command("docker exec -i paratunisie-postgres psql -v ON_ERROR_STOP=1 -U paratunisie -d paratunisie")
stdin.write(sql)
stdin.channel.shutdown_write()
print("OUT:", stdout.read().decode())
err = stderr.read().decode()
if err: print("ERR:", err)
ssh.close()
print("Category SEO hubs updated!")
