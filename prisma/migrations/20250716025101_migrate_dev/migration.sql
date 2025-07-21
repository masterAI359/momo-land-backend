/*
  Warnings:

  - The values [DELETE_CONTENT,HIDE_CONTENT,FEATURE_CONTENT,UNFEATURE_CONTENT] on the enum `ModerationActionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isActive` on the `chat_rooms` table. All the data in the column will be lost.
  - You are about to drop the column `isBlocked` on the `chat_rooms` table. All the data in the column will be lost.
  - You are about to drop the column `blockedAt` on the `room_members` table. All the data in the column will be lost.
  - You are about to drop the column `blockedBy` on the `room_members` table. All the data in the column will be lost.
  - You are about to drop the column `isBlocked` on the `room_members` table. All the data in the column will be lost.
  - You are about to drop the column `isMuted` on the `room_members` table. All the data in the column will be lost.
  - You are about to drop the column `mutedUntil` on the `room_members` table. All the data in the column will be lost.
  - You are about to drop the column `artistRanking` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `followersCount` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `followingCount` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isArtist` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isMuted` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isPreDebut` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `muteReason` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mutedUntil` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `artist_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `artist_rankings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `backup_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blog_emoticons` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `emoticons` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fan_club_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fan_club_posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fan_clubs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `follows` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ModerationActionType_new" AS ENUM ('WARN', 'SUSPEND', 'BAN', 'BLOCK', 'UNBAN', 'UNSUSPEND', 'UNBLOCK', 'MUTE', 'UNMUTE');
ALTER TABLE "moderation_actions" ALTER COLUMN "action" TYPE "ModerationActionType_new" USING ("action"::text::"ModerationActionType_new");
ALTER TYPE "ModerationActionType" RENAME TO "ModerationActionType_old";
ALTER TYPE "ModerationActionType_new" RENAME TO "ModerationActionType";
DROP TYPE "ModerationActionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "artist_profiles" DROP CONSTRAINT "artist_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "artist_rankings" DROP CONSTRAINT "artist_rankings_artistId_fkey";

-- DropForeignKey
ALTER TABLE "blog_emoticons" DROP CONSTRAINT "blog_emoticons_emoticonId_fkey";

-- DropForeignKey
ALTER TABLE "blog_emoticons" DROP CONSTRAINT "blog_emoticons_postId_fkey";

-- DropForeignKey
ALTER TABLE "blog_emoticons" DROP CONSTRAINT "blog_emoticons_userId_fkey";

-- DropForeignKey
ALTER TABLE "emoticons" DROP CONSTRAINT "emoticons_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "fan_club_members" DROP CONSTRAINT "fan_club_members_fanClubId_fkey";

-- DropForeignKey
ALTER TABLE "fan_club_members" DROP CONSTRAINT "fan_club_members_userId_fkey";

-- DropForeignKey
ALTER TABLE "fan_club_posts" DROP CONSTRAINT "fan_club_posts_authorId_fkey";

-- DropForeignKey
ALTER TABLE "fan_club_posts" DROP CONSTRAINT "fan_club_posts_fanClubId_fkey";

-- DropForeignKey
ALTER TABLE "fan_clubs" DROP CONSTRAINT "fan_clubs_artistId_fkey";

-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_followerId_fkey";

-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_followingId_fkey";

-- AlterTable
ALTER TABLE "chat_rooms" DROP COLUMN "isActive",
DROP COLUMN "isBlocked";

-- AlterTable
ALTER TABLE "room_members" DROP COLUMN "blockedAt",
DROP COLUMN "blockedBy",
DROP COLUMN "isBlocked",
DROP COLUMN "isMuted",
DROP COLUMN "mutedUntil";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "artistRanking",
DROP COLUMN "followersCount",
DROP COLUMN "followingCount",
DROP COLUMN "isArtist",
DROP COLUMN "isMuted",
DROP COLUMN "isPreDebut",
DROP COLUMN "muteReason",
DROP COLUMN "mutedUntil";

-- DropTable
DROP TABLE "artist_profiles";

-- DropTable
DROP TABLE "artist_rankings";

-- DropTable
DROP TABLE "backup_logs";

-- DropTable
DROP TABLE "blog_emoticons";

-- DropTable
DROP TABLE "emoticons";

-- DropTable
DROP TABLE "fan_club_members";

-- DropTable
DROP TABLE "fan_club_posts";

-- DropTable
DROP TABLE "fan_clubs";

-- DropTable
DROP TABLE "follows";
