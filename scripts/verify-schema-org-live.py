import urllib.request
import re
import json

ROUTES = [
    "/",
    "/creatine",
    "/produits/creatine-monohydrate-ostrovit-500gr",
    "/conseils/meilleure-creatine-tunisie"
]

def check():
    print("==================================================================")
    print("LIVE SCHEMA.ORG VALIDATION (ORGANIZATION, STORE & GRAPH NODES)")
    print("==================================================================\n")

    forbidden_org_keys = ["currenciesAccepted", "priceRange", "paymentAccepted"]

    all_passed = True

    for route in ROUTES:
        url = f"https://paratunisie.com{route}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode("utf-8")

        scripts = re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.DOTALL)
        print(f"Checking {route} ({len(scripts)} JSON-LD blocks found)...")

        for idx, s in enumerate(scripts):
            try:
                data = json.loads(s.strip())
                items = data.get("@graph", [data]) if isinstance(data, dict) else data

                for item in items:
                    t = item.get("@type")
                    item_id = item.get("@id", "no-id")

                    if t in ["Organization", "OnlineStore"]:
                        # Assert no forbidden keys
                        found_bad = [k for k in forbidden_org_keys if k in item]
                        if found_bad:
                            print(f"  [FAIL] {t} ({item_id}) contains forbidden keys: {found_bad}")
                            all_passed = False
                        else:
                            print(f"  [PASS] {t} ({item_id}) has valid schema properties (clean of {forbidden_org_keys})")

                    if t == "Product":
                        seller = item.get("offers", {}).get("seller", {})
                        print(f"  [PASS] Product Offer Seller: {seller.get('@id')} ({seller.get('name')})")

                    if t == "Article":
                        publisher = item.get("publisher", {})
                        print(f"  [PASS] Article Publisher: {publisher.get('@id')} ({publisher.get('name')})")

            except Exception as e:
                print(f"  [FAIL] JSON parse error in block {idx}: {e}")
                all_passed = False

        print()

    if all_passed:
        print(">>> ALL SCHEMA.ORG LIVE VALIDATIONS PASSED WITH 0 ERRORS! <<<")
    else:
        print(">>> SOME VALIDATIONS FAILED! <<<")

if __name__ == "__main__":
    check()
