#!/usr/bin/env bash
# Repeatable mobile Lighthouse benchmark (lab data, simulated slow 4G + 4x CPU throttle by default).
# usage: LH_DIR=/path/with/lighthouse BASE=https://paratunisie.com RUNS=3 bash ops/seo/lighthouse-bench.sh /vitamines /
#   install once: mkdir lh && cd lh && npm init -y && npm i lighthouse@12
set -euo pipefail
BASE="${BASE:-https://paratunisie.com}"
RUNS="${RUNS:-3}"
LH_DIR="${LH_DIR:?set LH_DIR to the folder where lighthouse is installed}"
CHROME_PATH="${CHROME_PATH:-C:/Program Files/Google/Chrome/Application/chrome.exe}"
export CHROME_PATH
OUT="${OUT:-$LH_DIR/out}"; mkdir -p "$OUT"
for path in "$@"; do
  for i in $(seq 1 "$RUNS"); do
    f="$OUT/$(echo "$path" | tr '/' '_' | sed 's/^_$/home/;s/^_//')-$i.json"
    node "$LH_DIR/node_modules/lighthouse/cli/index.js" "$BASE$path" --only-categories=performance \
      --form-factor=mobile --output=json --output-path="$f" --quiet \
      --chrome-flags="--headless=new --no-sandbox" >/dev/null 2>&1 || echo "run failed: $path #$i"
  done
done
node -e '
const fs=require("fs"),path=require("path");const dir=process.argv[1];const rows={};
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith(".json"))){
  const d=JSON.parse(fs.readFileSync(path.join(dir,f)));const a=d.audits;const k=f.replace(/-\d+\.json$/,"");
  (rows[k]=rows[k]||[]).push({perf:Math.round(d.categories.performance.score*100),lcp:a["largest-contentful-paint"].numericValue,tbt:a["total-blocking-time"].numericValue,cls:a["cumulative-layout-shift"].numericValue,ttfb:a["server-response-time"].numericValue,kb:a["total-byte-weight"].numericValue/1024,fcp:a["first-contentful-paint"].numericValue});
}
const med=(x)=>{const s=[...x].sort((p,q)=>p-q);return s[Math.floor(s.length/2)]};
console.log("page                 runs perf  LCP(s) FCP(s) TBT(ms) CLS   TTFB(ms) KB");
for(const [k,v] of Object.entries(rows)) console.log(k.padEnd(20),String(v.length).padStart(4),String(med(v.map(r=>r.perf))).padStart(4),(med(v.map(r=>r.lcp))/1000).toFixed(1).padStart(7),(med(v.map(r=>r.fcp))/1000).toFixed(1).padStart(6),String(Math.round(med(v.map(r=>r.tbt)))).padStart(7),med(v.map(r=>r.cls)).toFixed(3).padStart(6),String(Math.round(med(v.map(r=>r.ttfb)))).padStart(8),String(Math.round(med(v.map(r=>r.kb)))).padStart(5));
' "$OUT"
