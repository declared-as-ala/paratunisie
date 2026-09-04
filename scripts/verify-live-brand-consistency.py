import urllib.request
import urllib.parse
import re
import json

BASE_URL = "https://paratunisie.com"

ROUTES = [
    "/",
    "/shop",
    "/a-propos",
    "/aide",
    "/contact",
    "/mentions-legales",
]

def fetch(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    )
    with urllib.request.urlopen(req, timeout=10) as response:
        return response.status, response.read().decode("utf-8")

def check_redirect():
    url = "https://www.paratunisie.com/"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    )
    # Don't auto follow redirects to check 301/308
    class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
        def http_error_301(self, req, fp, code, msg, headers):
            return fp
        def http_error_302(self, req, fp, code, msg, headers):
            return fp
        def http_error_307(self, req, fp, code, msg, headers):
            return fp
        def http_error_308(self, req, fp, code, msg, headers):
            return fp

    opener = urllib.request.build_opener(NoRedirectHandler)
    try:
        res = opener.open(req, timeout=10)
        print(f"[WWW REDIRECT] Status: {res.status} Location: {res.headers.get('Location')}")
    except Exception as e:
        print(f"[WWW REDIRECT EXCEPTION] {e}")

def main():
    print("==================================================")
    print("LIVE BRAND CONSISTENCY & ENTITY SEO VERIFICATION")
    print("==================================================")

    check_redirect()
    print("--------------------------------------------------")

    forbidden_terms = [
        "numéro 1 en tunisie",
        "leader en tunisie",
        "la référence en tunisie",
        "destination parapharmaceutique numéro 1",
        "100% authentique garanti",
        "concentrations cliniquement validées",
        "conseils personnalisés par nos pharmaciens",
        "nos pharmaciens",
        "nos préparateurs",
        "distributeur officiel",
        "revendeur agréé",
        "partenaire officiel"
    ]

    for route in ROUTES:
        url = f"{BASE_URL}{route}"
        status, html = fetch(url)
        print(f"\n[ROUTE] {route} (Status: {status})")

        # Extract Title
        title_match = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
        title = title_match.group(1).strip() if title_match else "NONE"
        print(f"  Title: {title}")

        # Extract Meta Description
        meta_desc_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']', html, re.IGNORECASE)
        if not meta_desc_match:
            meta_desc_match = re.search(r'<meta[^>]*content=["\'](.*?)["\'][^>]*name=["\']description["\']', html, re.IGNORECASE)
        meta_desc = meta_desc_match.group(1).strip() if meta_desc_match else "NONE"
        print(f"  Meta Description: {meta_desc}")

        # Extract Canonical
        canonical_match = re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\'](.*?)["\']', html, re.IGNORECASE)
        canonical = canonical_match.group(1).strip() if canonical_match else "NONE"
        print(f"  Canonical: {canonical}")

        # Extract H1
        h1_match = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.IGNORECASE | re.DOTALL)
        if h1_match:
            clean_h1 = re.sub(r"<[^>]+>", " ", h1_match.group(1)).strip()
            clean_h1 = " ".join(clean_h1.split())
            print(f"  H1: {clean_h1}")
        else:
            print(f"  H1: NONE")

        # Check for forbidden claims in body text
        html_lower = html.lower()
        found_forbidden = []
        for term in forbidden_terms:
            if term in html_lower:
                found_forbidden.append(term)
        if found_forbidden:
            print(f"  [WARNING] FORBIDDEN CLAIMS FOUND: {found_forbidden}")
        else:
            print(f"  [PASS] No unsupported or contradictory claims found.")

        # Check JSON-LD
        json_ld_matches = re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.IGNORECASE | re.DOTALL)
        for jld in json_ld_matches:
            try:
                data = json.loads(jld.strip())
                types = []
                if isinstance(data, dict):
                    types.append(data.get("@type", "Unknown"))
                    if "@graph" in data:
                        for item in data["@graph"]:
                            types.append(item.get("@type", "Unknown"))
                elif isinstance(data, list):
                    for item in data:
                        types.append(item.get("@type", "Unknown"))
                print(f"  JSON-LD Schema Types: {', '.join(types)}")
                if route == "/" and "OnlineStore" in types or "Organization" in types:
                    org_data = data if data.get("@type") in ["OnlineStore", "Organization"] else next((item for item in data.get("@graph", []) if item.get("@type") in ["OnlineStore", "Organization"]), {})
                    print(f"    Name: {org_data.get('name')}")
                    print(f"    Url: {org_data.get('url')}")
                    print(f"    sameAs: {org_data.get('sameAs')}")
            except Exception as e:
                pass

if __name__ == "__main__":
    main()
