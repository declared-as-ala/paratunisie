import { NestFactory } from "@nestjs/core";
import { AppModule } from "../../app.module";
import { ImportsService } from "../services/imports.service";

async function runCli() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const importsService = app.get(ImportsService);

  const args = process.argv.slice(2);
  const actionArg = args.find((a) => a.startsWith("--action="))?.split("=")[1] || "discover";
  const limitArg = parseInt(args.find((a) => a.startsWith("--limit="))?.split("=")[1] || "10", 10);
  const dryRun = args.includes("--dry-run");
  const brand = args.find((a) => a.startsWith("--brand="))?.split("=")[1];

  console.log(`\n--- ParaTunisie Catalog Import CLI ---`);
  console.log(`Action: ${actionArg} | Limit: ${limitArg} | DryRun: ${dryRun} | Brand: ${brand || "All"}\n`);

  try {
    if (actionArg === "discover") {
      const result = await importsService.discoverCatalog({ limit: limitArg, dryRun });
      console.log(`Découverte terminée:`, result);
    } else if (actionArg === "import") {
      const result = await importsService.runImportBatch({ limit: limitArg, dryRun, brandName: brand });
      console.log(`Importation terminée:`, result);
    } else {
      console.log(`Action inconnue: ${actionArg}. Actions disponibles: discover, import.`);
    }
  } catch (err) {
    console.error(`Erreur CLI:`, (err as Error).message);
  } finally {
    await app.close();
  }
}

void runCli();
