# -*- coding: utf-8 -*-
import json

with open("scripts/editorial_manifest_100.json", encoding="utf-8") as f:
    manifest = json.load(f)

with open("scripts/valid_unsplash_ids.txt", encoding="utf-8") as f:
    valid_set = set(line.strip() for line in f if line.strip())

# Thematic unique photo pools (100 unique IDs total, strictly matched to cluster subject)
THEMATIC_POOLS = {
    "Créatine": [
        "photo-1517963879433-6ad2b056d712", "photo-1521804906057-1df8fdb718b7", "photo-1534367507873-d2d7e24c797f",
        "photo-1581009146145-b5ef050c2e1e", "photo-1540497077202-7c8a3999166f", "photo-1583454110551-21f2fa2afe61",
        "photo-1526506118085-60ce8714f8c5", "photo-1517838277536-f5f99be501cd", "photo-1574680096145-d05b474e2155",
        "photo-1571019614242-c5c5dee9f50b", "photo-1599058917212-d750089bc07e", "photo-1584735935682-2f2b69dff9d2",
    ],
    "Whey & Protéines": [
        "photo-1579722820308-d74e571900a9", "photo-1593095948071-474c5cc2989d", "photo-1546069901-ba9599a7e63c",
        "photo-1534438327276-14e5300c3a48", "photo-1517836357463-d25dfeac3438", "photo-1526401485004-46910ecc8e51",
        "photo-1576678927484-cc907957088c", "photo-1550345332-09e3ac987658", "photo-1581009137042-c552e485697a",
        "photo-1541534741688-6078c6bfb5c5", "photo-1571019613454-1cb2f99b2d8b", "photo-1522898467493-49726bf28798",
    ],
    "Ashwagandha": [
        "photo-1518241353330-0f7941c2d9b5", "photo-1506126613408-eca07ce68773", "photo-1544367567-0f2fcb009e0b",
        "photo-1616046229478-9901c5536a45", "photo-1471864190281-a93a3070b6de", "photo-1515377905703-c4788e51af15",
        "photo-1545205597-3d9d02c29597", "photo-1564890369478-c89ca6d9cde9", "photo-1556679343-c7306c1976bc",
        "photo-1597481499750-3e6b22637e12",
    ],
    "Magnésium": [
        "photo-1541781774459-bb2af2f05b55", "photo-1517256064527-09c73fc73e38", "photo-1519823551278-64ac92734fb1",
        "photo-1540555700478-4be289fbecef", "photo-1512290923902-8a9f81dc236c", "photo-1508672019048-805c876b67e2",
        "photo-1552693673-1bf958298935", "photo-1507652313519-d4e9174996dd", "photo-1531353826977-0941b4779a1c",
        "photo-1498837167922-ddd27525d352",
    ],
    "Oméga 3": [
        "photo-1607613009820-a29f7bb81c04", "photo-1519708227418-c8fd9a32b7a2", "photo-1467003909585-2f8a72700288",
        "photo-1534422298391-e4f8c172dddb", "photo-1512621776951-a57141f2eefd", "photo-1540420773420-3366772f4999",
        "photo-1490645935967-10de6ba17061", "photo-1505576399279-565b52d4ac71", "photo-1543362906-acfc16c67564",
        "photo-1511690656952-34342bb7c2f2",
    ],
    "Collagène": [
        "photo-1570172619644-dfd03ed5d881", "photo-1556228720-195a672e8a03", "photo-1556228578-0d85b1a4d571",
        "photo-1598440947619-2c35fc9aa908", "photo-1616394584738-fc6e612e71b9", "photo-1522337360788-8b13dee7a37e",
        "photo-1515378791036-0648a3ef77b2", "photo-1518611012118-696072aa579a", "photo-1590487988256-9ed24133863e",
        "photo-1596357395217-80de13130e92",
    ],
    "Vitamines & Minéraux": [
        "photo-1512069772995-ec65ed45afd6", "photo-1628771065518-0d82f1938462", "photo-1584308666744-24d5c474f2ae",
        "photo-1587854692152-cbe660dbde88", "photo-1559757175-5700dde675bc", "photo-1585435557343-3b092031a831",
        "photo-1610832958506-aa56368176cf", "photo-1557844352-761f2565b576", "photo-1582979512210-99b6a53386f9",
        "photo-1550258987-190a2d41a8ba",
    ],
    "Probiotiques & Digestion": [
        "photo-1488477181946-6428a0291777", "photo-1571212515416-fef01fc43637", "photo-1563636619-e9143da7973b",
        "photo-1490818387583-1baba5e638af", "photo-1509440159596-0249088772ff", "photo-1573246123716-6b1782bfc499",
        "photo-1528825871115-3581a5387919", "photo-1565299585323-38d6b0865b47",
    ],
    "Pré-workout": [
        "photo-1549060279-7e168fcee0c2", "photo-1552674605-db6ffd4facb5", "photo-1538805060514-97d9cc17730c",
        "photo-1594882645126-14020914d58d", "photo-1476480862126-209bfaa8edc8", "photo-1486218119243-13883505764c",
        "photo-1502680390469-be75c86b636f", "photo-1518310383802-640c2de311b2",
    ],
    "Guides d'achat": [
        "photo-1586769852044-692d6e3703f0", "photo-1505751172876-fa1923c5c528", "photo-1579684385127-1ef15d508118",
        "photo-1576091160399-112ba8d25d1d", "photo-1584362917165-526a968579e8", "photo-1532187863486-abf9dbad1b69",
        "photo-1582719471384-894fbb16e074", "photo-1579154204601-01588f351e67", "photo-1581093588401-fbb62a02f120",
        "photo-1563213126-a4273aed2016",
    ],
}

used = set()
cluster_counters = {}
for item in manifest:
    c = item["cluster"]
    idx = cluster_counters.get(c, 0)
    cluster_counters[c] = idx + 1
    pid = THEMATIC_POOLS[c][idx]
    assert pid in valid_set, f"Invalid pid: {pid}"
    assert pid not in used, f"Duplicate pid: {pid}"
    used.add(pid)
    item["unsplash_photo_id"] = pid
    item["unsplash_url"] = f"https://images.unsplash.com/{pid}?w=1200&h=675&fit=crop&q=85"

with open("scripts/editorial_manifest_100.json", "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print(f"Reassigned {len(used)} unique thematic Unsplash photos across all 100 articles!")
