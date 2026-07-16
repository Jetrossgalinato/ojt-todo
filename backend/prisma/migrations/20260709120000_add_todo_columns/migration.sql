-- AlterTable
ALTER TABLE "public"."Todo" ADD COLUMN "dueDate" TIMESTAMP(3),
  ADD COLUMN "dueTime" TEXT,
  ADD COLUMN "listName" TEXT,
  ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'medium',
  ADD COLUMN "tags" TEXT;
