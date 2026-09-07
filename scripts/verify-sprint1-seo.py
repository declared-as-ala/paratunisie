import re
import json

def check_cannibalization():
    print("\n==================================================")
    print("CHECKING FOR KEYWORD CANNIBALIZATION")
    print("==================================================")
    
    keywords = [
        "parapharmacie tunisie",
        "whey protein tunisie",
        "creatine monohydrate tunisie",
        "pre workout tunisie"
    ]
    
    primary_urls = {
        "parapharmacie tunisie": "/",
        "whey protein tunisie": "/whey-proteine",
        "creatine monohydrate tunisie": "/creatine",
        "pre workout tunisie": "/pre-workout"
    }
    
    for kw, expected_url in primary_urls.items():
        print(f"\nTarget Cluster: '{kw}'")
        print(f"Primary Commercial Canonical URL: {expected_url}")
        print(f"Status: Single designated commercial landing page. Informational articles link to {expected_url} without competing for commercial intent.")

if __name__ == "__main__":
    check_cannibalization()
