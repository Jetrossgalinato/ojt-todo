-- CreateTable
CREATE TABLE "public"."UserSettings" (
    "userId" TEXT NOT NULL,
    "accentColor" TEXT NOT NULL DEFAULT 'Teal',
    "dueReminders" BOOLEAN NOT NULL DEFAULT true,
    "reminderTime" TEXT NOT NULL DEFAULT '1 hour before',
    "overdueAlerts" BOOLEAN NOT NULL DEFAULT true,
    "dailyDigest" BOOLEAN NOT NULL DEFAULT false,
    "digestTime" TEXT NOT NULL DEFAULT '8:00 AM',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT false,
    "notificationSound" BOOLEAN NOT NULL DEFAULT true,
    "highPriorityOnly" BOOLEAN NOT NULL DEFAULT false,
    "lastDigestSentDate" DATE,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "public"."UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN "notifiedDue" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "notifiedOverdue" BOOLEAN NOT NULL DEFAULT false;
