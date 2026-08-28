const fs = require('fs');
const path = require('path');

const oldArticlesBackup = [
  {
    slug: "routine-peau-grasse-guide-complet",
    title: "Routine peau grasse : le guide complet",
    url: "https://paratunisie.com/conseils/routine-peau-grasse-guide-complet",
    category: "Visage",
    status: "PUBLISHED",
    date: "2026-07-15",
    redirectTarget: "/conseils", // Or appropriate category
    redirectType: 301,
  },
  {
    slug: "protection-solaire-tunisie-guide",
    title: "Protection solaire en Tunisie : comment bien choisir",
    url: "https://paratunisie.com/conseils/protection-solaire-tunisie-guide",
    category: "Solaire",
    status: "PUBLISHED",
    date: "2026-06-28",
    redirectTarget: "/conseils",
    redirectType: 301,
  },
  {
    slug: "routine-anti-age-debut",
    title: "Quand commencer une routine anti-âge ?",
    url: "https://paratunisie.com/conseils/routine-anti-age-debut",
    category: "Visage",
    status: "PUBLISHED",
    date: "2026-06-10",
    redirectTarget: "/conseils/complements-musculation-debutant",
    redirectType: 301,
  },
  {
    slug: "peau-sensible-calmee",
    title: "Peau sensible : les gestes pour l'apaiser",
    url: "https://paratunisie.com/conseils/peau-sensible-calmee",
    category: "Visage",
    status: "PUBLISHED",
    date: "2026-05-22",
    redirectTarget: "/conseils/omega-3-tunisie-guide",
    redirectType: 301,
  },
  {
    slug: "chute-cheveux-precautions",
    title: "Chute de cheveux : les précautions à prendre",
    url: "https://paratunisie.com/conseils/chute-cheveux-precautions",
    category: "Cheveux",
    status: "PUBLISHED",
    date: "2026-05-08",
    redirectTarget: "/conseils/zinc-sportif-musculation",
    redirectType: 301,
  },
  {
    slug: "hydratation-peau-seche-hiver",
    title: "Hydrater sa peau sèche en hiver",
    url: "https://paratunisie.com/conseils/hydratation-peau-seche-hiver",
    category: "Corps",
    status: "PUBLISHED",
    date: "2026-04-18",
    redirectTarget: "/conseils/omega-3-tunisie-guide",
    redirectType: 301,
  }
];

const backupDir = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}
const backupPath = path.join(backupDir, 'old-articles-backup-20260828.json');
fs.writeFileSync(backupPath, JSON.stringify(oldArticlesBackup, null, 2), 'utf-8');
console.log(`✓ Backed up ${oldArticlesBackup.length} old articles to ${backupPath}`);
module.exports = { oldArticlesBackup };
