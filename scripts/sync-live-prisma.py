import sys
import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)

# Script to run inside paratunisie-api
node_script = """
const { PrismaClient } = require('@prisma/client');
const https = require('https');
const prisma = new PrismaClient();

function queryAramex(hawbs) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      ClientInfo: {
        UserName: "bitoutawalid@gmail.com",
        Password: "Walid@bitouta@0000",
        Version: "v1.0",
        AccountNumber: "60506486",
        AccountPin: "321321",
        AccountEntity: "TUN",
        AccountCountryCode: "TN",
        Source: 24
      },
      Transaction: { Reference1: "sync-init", Reference2: "", Reference3: "", Reference4: "", Reference5: "" },
      Shipments: hawbs,
      GetLastTrackingUpdateOnly: false
    });

    const req = https.request('https://ws.aramex.net/ShippingAPI.V2/Tracking/Service_1_0.svc/json/TrackShipments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      rejectUnauthorized: false
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function normalizeTracking(results) {
  const checkpoints = (results || []).map(item => {
    const dateStr = item.UpdateDateTime || item.UpdateDate || "";
    let date = new Date();
    let isoDate = new Date().toISOString();
    try {
      if (dateStr) {
        if (typeof dateStr === "string" && dateStr.includes("/Date(")) {
          const ms = parseInt(dateStr.replace(/[^0-9]/g, ""), 10);
          if (!isNaN(ms)) date = new Date(ms);
        } else {
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) date = d;
        }
      }
      isoDate = !isNaN(date.getTime()) ? date.toISOString() : new Date().toISOString();
    } catch (e) {
      isoDate = new Date().toISOString();
    }
    return {
      code: (item.UpdateCode || "").toUpperCase(),
      description: item.UpdateDescription || "",
      location: item.UpdateLocation || "",
      date: isoDate,
      comments: item.Comments || "",
    };
  });

  if (checkpoints.length === 0) {
    return {
      status: "CREATED",
      label: "Créée",
      code: "SH014",
      description: "Bordereau créé chez Aramex",
      location: "Tunis",
      events: []
    };
  }

  const hasDelivered = checkpoints.some(c => c.code === "SH005" || c.description.toLowerCase().includes("delivered"));
  const hasReturned = checkpoints.some(c => c.code === "SH069" || c.description.toLowerCase().includes("returned to shipper"));
  const latest = checkpoints[0];
  const code = latest.code;
  const desc = latest.description.toLowerCase();
  const comm = latest.comments.toLowerCase();

  let status = "IN_TRANSIT";
  let label = "En transit";

  if (hasDelivered && (!hasReturned || checkpoints.findIndex(c => c.code === "SH005") < checkpoints.findIndex(c => c.code === "SH069"))) {
    status = "DELIVERED";
    label = "Livrée";
  } else if (hasReturned) {
    status = "RETURNED";
    label = "Retournée";
  } else if (["SH498", "SH070"].includes(code) || desc.includes("pending return") || comm.includes("pending return")) {
    status = "RETURNING";
    label = "En cours de retour";
  } else if (code === "SH043" || desc.includes("return requested")) {
    status = "RETURN_REQUESTED";
    label = "Retour demandé";
  } else if (code === "SH034" || desc.includes("payment was declined") || comm.includes("payment was declined") || desc.includes("refused")) {
    status = "REFUSED";
    label = "Refusée";
  } else if (["SH033", "SH294", "SH515"].includes(code) || desc.includes("not available") || desc.includes("no answer") || desc.includes("cannot be reached") || desc.includes("did not respond") || desc.includes("busy") || desc.includes("attempted")) {
    status = "DELIVERY_ATTEMPT";
    if (desc.includes("busy") || desc.includes("cannot be reached") || desc.includes("no answer") || desc.includes("did not respond")) {
      label = "Client injoignable";
    } else if (desc.includes("not available")) {
      label = "Client absent";
    } else {
      label = "Tentative de livraison";
    }
  } else if (["SH003", "SH004"].includes(code) || desc.includes("out for delivery")) {
    status = "OUT_FOR_DELIVERY";
    label = "En cours de livraison";
  } else if (["SH012", "SH314"].includes(code) || desc.includes("picked up")) {
    status = "PICKED_UP";
    label = "Collectée";
  } else if (code === "SH011") {
    status = "PICKUP_REQUESTED";
    label = "Ramassage demandé";
  } else if (code === "SH014") {
    status = "CREATED";
    label = "Créée";
  } else if (code === "SH015") {
    status = "CANCELLED";
    label = "Annulée";
  }

  return {
    status,
    label,
    code: latest.code,
    description: latest.description,
    location: latest.location,
    events: checkpoints
  };
}

async function run() {
  const shipments = await prisma.shipment.findMany();
  console.log(`Found ${shipments.length} shipments to sync.`);

  const hawbs = shipments.map(s => s.hawb || s.tracking).filter(Boolean);
  if (hawbs.length === 0) {
    console.log("No HAWBs found.");
    return;
  }

  console.log(`Querying Aramex for ${hawbs.length} HAWBs...`);
  const res = await queryAramex(hawbs);
  const results = res.TrackingResults || [];

  for (const tr of results) {
    const h = tr.Key;
    const values = tr.Value || [];
    const norm = normalizeTracking(values);

    console.log(`Syncing HAWB ${h} -> [${norm.status}] ${norm.label} (${norm.location})`);

    await prisma.shipment.updateMany({
      where: {
        OR: [{ hawb: h }, { tracking: h }]
      },
      data: {
        trackingStatus: norm.status,
        trackingLabel: norm.label,
        trackingCode: norm.code,
        trackingDescription: norm.description,
        trackingLocation: norm.location,
        trackingEvents: JSON.stringify(norm.events),
        lastAramexSync: new Date(),
        lastTrackingUpdate: new Date(),
        ...(norm.status === "DELIVERED" ? { deliveredAt: new Date() } : {}),
        ...(norm.status === "RETURNED" ? { returnedAt: new Date() } : {})
      }
    });
  }

  const finalCheck = await prisma.shipment.findMany({
    select: {
      id: true,
      orderId: true,
      hawb: true,
      trackingStatus: true,
      trackingLabel: true,
      trackingLocation: true,
      lastAramexSync: true
    }
  });

  console.log("\\n=== SYNC COMPLETE ===");
  console.log(JSON.stringify(finalCheck, null, 2));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
"""

sftp = client.open_sftp()
with sftp.file("/tmp/sync_db.js", "w") as f:
    f.write(node_script)
sftp.close()

stdin, stdout, stderr = client.exec_command("docker cp /tmp/sync_db.js paratunisie-api:/app/sync_db.js && docker exec -i paratunisie-api node /app/sync_db.js")
out = stdout.read().decode("utf-8", errors="replace")
err = stderr.read().decode("utf-8", errors="replace")
print(out)
if err.strip():
    print("STDERR:", err)

client.close()
