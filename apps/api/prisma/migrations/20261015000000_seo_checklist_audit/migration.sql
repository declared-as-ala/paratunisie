-- Evidence-gated SEO checklist scoring (Growth Sprint 2).
CREATE TABLE "SeoChecklistAudit" (
    "key" TEXT NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "evidence" JSONB NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeoChecklistAudit_pkey" PRIMARY KEY ("key")
);
