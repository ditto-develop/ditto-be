-- CreateEnum
CREATE TYPE "ChatRoomStatus" AS ENUM ('ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "ChatRoomEndedReason" AS ENUM ('USER_LEFT', 'EXPIRED');

-- AlterTable
ALTER TABLE "chat_rooms"
ADD COLUMN "status" "ChatRoomStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "endedAt" TIMESTAMP(3),
ADD COLUMN "endedByUserId" TEXT,
ADD COLUMN "endedReason" "ChatRoomEndedReason";
