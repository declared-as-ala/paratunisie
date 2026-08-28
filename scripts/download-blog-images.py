import os
import urllib.request
import json

os.makedirs("public/assets/blog", exist_ok=True)

# Curated high quality Unsplash photos for each specific sports nutrition topic
ARTICLE_IMAGES = {
    "meilleure-creatine-tunisie": "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=1000&auto=format&fit=crop", # Supplements tub & scoop
    "creatine-monohydrate-bienfaits-dosage": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1000&auto=format&fit=crop", # Workout gym focus
    "creatine-avant-ou-apres-entrainement": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop", # Gym shaker & weights
    "whey-protein-tunisie-guide": "https://images.unsplash.com/photo-1579722820308-d74e571900a9?q=80&w=1000&auto=format&fit=crop", # Protein shake & powder
    "whey-ou-gainer-prise-de-masse": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1000&auto=format&fit=crop", # Bodybuilder training barbell
    "prise-de-masse-tunisie-guide": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop", # Heavy gym deadlift & mass
    "meilleur-pre-workout-tunisie": "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1000&auto=format&fit=crop", # Intense gym workout energy
    "pre-workout-ou-creatine": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop", # Athlete training with dumbbells
    "bcaa-ou-eaa": "https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=1000&auto=format&fit=crop", # Hydration & intra workout drink
    "citrulline-arginine-beta-alanine": "https://images.unsplash.com/photo-1581009137042-c552e485697a?q=80&w=1000&auto=format&fit=crop", # Muscular vascular pump
    "ashwagandha-tunisie-guide": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=1000&auto=format&fit=crop", # Natural wellness & herbal capsules
    "quand-prendre-ashwagandha": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop", # Recovery & relaxation
    "vitamine-d3-k2-tunisie": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop", # Sun, vitality & bone health
    "zinc-sportif-musculation": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1000&auto=format&fit=crop", # Mineral capsules & health
    "omega-3-tunisie-guide": "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=1000&auto=format&fit=crop", # Golden fish oil omega 3 capsules
    "multivitamines-sportifs": "https://images.unsplash.com/photo-1577401239170-897942555fb3?q=80&w=1000&auto=format&fit=crop", # Vitamins & minerals
    "l-carnitine-perte-graisse": "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1000&auto=format&fit=crop", # Running & cardio fat burn
    "bruleur-de-graisse-tunisie": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1000&auto=format&fit=crop", # Fitness lean body definition
    "complements-musculation-debutant": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop", # Beginner workout gym
    "complements-avant-pendant-apres-entrainement": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1000&auto=format&fit=crop" # Complete peri-workout routine
}

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for slug, url in ARTICLE_IMAGES.items():
    dest = f"public/assets/blog/{slug}.webp"
    print(f"Downloading {slug} -> {dest}...")
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp, open(dest, 'wb') as f:
            f.write(resp.read())
        print(f"  [OK] {dest} saved ({os.path.getsize(dest)} bytes)")
    except Exception as e:
        print(f"  [ERR] Error for {slug}: {e}")

print("All 20 article images downloaded successfully!")
