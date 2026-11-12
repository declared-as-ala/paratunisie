# Catalogue SEO maintenance

This workflow operates on the current PostgreSQL/Prisma catalogue, not the original SQL import. Do not rerun the Sobitas importer: it would overwrite later catalogue edits and could restore deleted products.

1. Take a database backup and export the current catalogue with `export-catalogue.cjs` inside the API environment.
2. Run `python ops/seo/prepare.py path/to/export.json path/to/output` locally. It produces a reviewable manifest, database audit summaries and manual-review exceptions. The category and selected product copy files are versioned editorial inputs.
3. Review the manifest. Existing populated SEO fields are preserved; imported non-custom titles without a Tunisia qualifier gain that qualifier. Imported HTML descriptions are converted to readable headings, paragraphs and lists; obsolete shop advertising and unsupported absolute advertising lines are removed. Four short equipment descriptions have individually written replacements based on the available information. Missing model specifications are explicitly identified. Optionally run `node ops/seo/score.cjs` after compiling the API evaluator to include internal quality indicators.
4. Copy `apply.cjs` and the manifest beside the API's Prisma installation. Run `node apply.cjs manifest.json` for a dry run. It checks current values against the export and aborts on conflicts.
5. Once matching application builds are ready, run with `--apply`. Changes are committed in one serializable transaction. Product IDs, prices, stock, customer records, orders and reviews are not changed. Category and brand URL migrations create redirect records.
6. Run the same `--apply` command again. The expected result is `changed: 0`. Export again for the after audit; the backup remains available for recovery.
7. Run `crawl.py export.json crawl.json` against the public site. It checks catalogue pages, the sitemap, discovered public links, pagination and image URLs. It does not submit forms or access customer accounts. A successful image response does not prove that it is a real photograph: the database audit separately identifies placeholders.
8. Run `node ops/seo/mobile-check.cjs` for read-only mobile rendering and filtering checks. The reported LCP and CLS are single lab observations, not field Core Web Vitals. INP requires interaction or real-user measurement and must not be reported as passed without evidence.

Generated reports live under `scratch/seo/`. `report.py` combines saved before/after observations without inventing results for checks that have not run. The source backup for this deployment is the existing checkout; rollback container images are tagged `before-seo` and the production database backup is at `/home/ubuntu/paratunisie/backups/seo-before/database.dump`.

Keyword storage uses the existing JSON array: the first entry is primary, the following entries are secondary/related terms. This avoids a database schema migration and remains editable in the shared admin SEO form. Article keyword storage uses the existing `targetKeyword` field through its editor. Open Graph fields also populate Twitter previews.

Existing public guides are exported to `static-articles.json` and imported into the article editor with stable IDs, actual product relations only, their existing publication dates and FAQs. Archived/deleted articles are not replaced with a static fallback in production.

Known source-data limitations must stay visible in the final report: one missing real product image, four empty category families, ten unconfirmed manufacturers, three unclassified bundles, equipment model specifications, and the need for professional review of inherited supplement claims. Composition heuristics identify records for review; they do not prove ingredient information is absent. Neither imported descriptions nor an internal completeness score establish clinical accuracy or a Google ranking guarantee.
