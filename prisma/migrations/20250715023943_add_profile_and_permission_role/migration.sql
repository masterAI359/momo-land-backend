-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "profileCompleteness" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "profileVisibility" TEXT NOT NULL DEFAULT 'public',
ADD COLUMN     "socialLinks" JSONB;
