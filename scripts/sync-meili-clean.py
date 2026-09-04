import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('145.223.118.9', port=22, username='root', password='3)\'qklBH#Dtv\'xY2')

sync_node_script = """
const { PrismaClient } = require("@prisma/client");
const { Meilisearch } = require("meilisearch");
const prisma = new PrismaClient();
const meili = new Meilisearch({ host: "http://paratunisie-meilisearch:7700", apiKey: process.env.MEILI_API_KEY });
async function sync() {
    const index = meili.index("products");
    const products = await prisma.product.findMany({
        where: { publishState: "PUBLISHED" },
        include: { brand: true, category: true, variants: true }
    });
    const docs = products.map(p => ({
        id: p.id,
        name: p.name,
        brandName: p.brand?.name || "",
        brandSlug: p.brand?.slug || "",
        categoryName: p.category?.name || "",
        categorySlug: p.category?.slug || "",
        description: p.description || "",
        benefit: p.benefit || "",
        publishState: p.publishState,
        inStock: p.inStock
    }));
    for (let i = 0; i < docs.length; i += 500) {
        await index.addDocuments(docs.slice(i, i + 500));
    }
    console.log(`Synced ${docs.length} products to MeiliSearch.`);
}
sync().catch(console.error);
"""

stdin, stdout, stderr = client.exec_command(f"docker exec -i paratunisie-api node << 'EOF'\n{sync_node_script}\nEOF")
print(stdout.read().decode())
client.close()
