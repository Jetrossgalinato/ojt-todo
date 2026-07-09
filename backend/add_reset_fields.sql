ALTER TABLE "public"."User" ADD COLUMN "resetPasswordToken" TEXT;
ALTER TABLE "public"."User" ADD COLUMN "resetPasswordExpires" TIMESTAMP(6);
ALTER TABLE "public"."User" ADD CONSTRAINT "User_resetPasswordToken_key" UNIQUE ("resetPasswordToken");