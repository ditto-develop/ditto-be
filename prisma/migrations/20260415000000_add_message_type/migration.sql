-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('CHAT', 'SYSTEM');

-- AlterTable: senderId nullable, type 컬럼 추가
ALTER TABLE "chat_messages"
ALTER COLUMN "senderId" DROP NOT NULL,
ADD COLUMN "type" "MessageType" NOT NULL DEFAULT 'CHAT';
