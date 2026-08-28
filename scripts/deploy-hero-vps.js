const { Client } = require('ssh2');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SSH_CONFIG = {
  host: '145.223.118.9',
  port: 22,
  username: 'root',
  password: `3)'qklBH#Dtv'xY2`,
  readyTimeout: 30000,
};

const BUNDLE_PATH = path.resolve(__dirname, '../deploy-hero.tgz');
const REMOTE_DIR = '/opt/paratunisie/app';

function execCommand(conn, cmd) {
  return new Promise((resolve, reject) => {
    console.log(`\n[VPS EXEC] >>> ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', (code) => {
        console.log(`[VPS EXEC END] code: ${code}`);
        resolve({ code, stdout, stderr });
      }).on('data', (d) => {
        stdout += d;
        process.stdout.write(d);
      }).stderr.on('data', (d) => {
        stderr += d;
        process.stderr.write(d);
      });
    });
  });
}

async function main() {
  const stats = fs.statSync(BUNDLE_PATH);
  console.log(`Bundle size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect(SSH_CONFIG);
  });
  console.log('✅ SSH Connected to VPS!');

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, s) => (err ? reject(err) : resolve(s)));
  });

  console.log('📤 Streaming deploy-hero.tgz to VPS...');
  await new Promise((resolve, reject) => {
    const rs = fs.createReadStream(BUNDLE_PATH);
    const ws = sftp.createWriteStream(`${REMOTE_DIR}/deploy-hero.tgz`);
    ws.on('close', resolve);
    ws.on('error', reject);
    rs.on('error', reject);
    rs.pipe(ws);
  });
  console.log('✅ Upload complete!');

  console.log('📂 Extracting on VPS...');
  await execCommand(conn, `cd ${REMOTE_DIR} && tar -xzf deploy-hero.tgz && rm -f deploy-hero.tgz`);

  console.log('🚀 Building and restarting paratunisie-web on VPS...');
  await execCommand(
    conn,
    `cd ${REMOTE_DIR} && docker compose -f docker-compose.prod.yml up -d --build --no-deps paratunisie-web`
  );

  console.log('⏳ Waiting 5s for container health...');
  await new Promise((r) => setTimeout(r, 5000));

  console.log('\n--- 🌐 Verification on Production VPS ---');
  await execCommand(conn, `docker ps --filter "name=paratunisie-web"`);
  await execCommand(conn, `curl -sI https://paratunisie.com/ | head -n 8`);
  await execCommand(conn, `curl -sI https://paratunisie.com/assets/hero-video-optimized.mp4 | head -n 8`);
  await execCommand(conn, `curl -sI https://paratunisie.com/assets/hero-poster.webp | head -n 8`);
  await execCommand(conn, `curl -sI "https://paratunisie.com/assets/hf_20260826_190907_af0b25d6-4401-4b39-8132-c86ed8c156f1.mp4" | head -n 8`);

  conn.end();
  console.log('\n✨ Hero video deployed and verified live on production!');
}

main().catch((err) => {
  console.error('Error during deployment:', err);
  process.exit(1);
});
