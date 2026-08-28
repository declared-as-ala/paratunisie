const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');

const VPS_HOST = '145.223.118.9';
const VPS_USER = 'root';
const VPS_PASSWORD = "3)'qklBH#Dtv'xY2";
const VPS_APP_PATH = '/opt/paratunisie/app';

// Files to include in the deployment package
// We'll upload: src, public/assets, public/uploads/products (new accessoires images only)
// and the seed file to run on VPS

async function main() {
  console.log('=== VPS DEPLOYMENT STARTED ===');

  // 1. Create deployment tar
  console.log('Creating deployment package...');
  const tarFile = 'deploy-accessoires.tgz';
  
  // Pack: all source changes + new accessoire images
  execSync(
    `tar.exe -czf ${tarFile} src/components/home/home-hero.tsx src/components/home/home-split-feature.tsx src/components/home/home-gammes-grid.tsx src/components/home/home-page.tsx src/components/layout/navigation/mega-menu.tsx public/uploads/products/protein-shaker-450ml-sport-life.webp public/uploads/products/bande-genoux.webp public/uploads/products/lifting-straps.webp public/uploads/products/bouteille-d-eau-2-2-litres.webp public/uploads/products/bandes-de-poignet.webp public/uploads/products/bandes-de-tirage.webp public/uploads/products/gants-de-musculation.webp public/uploads/products/gant-de-fitness.webp public/uploads/products/ceinture-dos-gold-s-gym.webp public/uploads/products/ceinture-dos-de-musculation.webp public/uploads/products/shaker-universal-nutrition-700ml.webp public/uploads/products/bouteille-d-eau-1-8-litres.webp public/uploads/products/gut-blaster-ab-slings.webp public/uploads/products/dip-belt.webp public/uploads/products/shaker-kong-700ml.webp apps/api/prisma/seed-accessoires.ts apps/api/prisma/sync-meili.js`,
    { stdio: 'inherit' }
  );
  console.log(`✅ Created ${tarFile}`);

  // 2. Upload via SFTP using psftp (PuTTY) or scp
  console.log('Uploading to VPS...');
  
  // Use scp approach
  try {
    execSync(
      `sshpass -p "${VPS_PASSWORD}" scp -o StrictHostKeyChecking=no ${tarFile} ${VPS_USER}@${VPS_HOST}:${VPS_APP_PATH}/`,
      { stdio: 'inherit', timeout: 120000 }
    );
    console.log('✅ Uploaded via scp');
  } catch(e) {
    console.log('scp not available, trying alternative...');
    // Alternative: use plink + pscp if on Windows
  }

  // 3. SSH commands to deploy
  const sshCommands = [
    `cd ${VPS_APP_PATH}`,
    `tar -xzf deploy-accessoires.tgz`,
    // Copy API images too
    `cp -r public/uploads/products/*.webp apps/api/public/uploads/products/ 2>/dev/null || true`,
    // Run accessoires seeder
    `cd apps/api && npx tsx prisma/seed-accessoires.ts`,
    `node prisma/sync-meili.js`,
    `cd ${VPS_APP_PATH}`,
    // Rebuild web only
    `docker compose -f docker-compose.prod.yml up -d --build --no-deps paratunisie-web`,
  ].join(' && ');

  try {
    execSync(
      `sshpass -p "${VPS_PASSWORD}" ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} "${sshCommands}"`,
      { stdio: 'inherit', timeout: 600000 }
    );
    console.log('✅ VPS deployment complete!');
  } catch(e) {
    console.error('SSH error:', e.message);
  }

  // Cleanup local tar
  fs.unlinkSync(tarFile);
  console.log('=== DEPLOYMENT DONE ===');
}

main().catch(console.error);
