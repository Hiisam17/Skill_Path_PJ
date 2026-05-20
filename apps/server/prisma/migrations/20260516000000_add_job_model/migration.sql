CREATE TABLE "Job" (
  "id" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "company" TEXT,
  "location" TEXT,
  "description" TEXT,
  "url" TEXT,
  "postedAt" TIMESTAMP(3),
  "crawledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Job_source_externalId_key" ON "Job"("source", "externalId");
CREATE INDEX "Job_source_idx" ON "Job"("source");
CREATE INDEX "Job_title_idx" ON "Job"("title");
CREATE INDEX "Job_crawledAt_idx" ON "Job"("crawledAt");
