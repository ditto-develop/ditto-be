-- CreateEnum
CREATE TYPE "VoteOptionType" AS ENUM ('PLACE', 'TIME');

-- CreateEnum
CREATE TYPE "VoteStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateTable
CREATE TABLE "chat_votes" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "allowMultiple" BOOLEAN NOT NULL DEFAULT false,
    "status" "VoteStatus" NOT NULL DEFAULT 'ACTIVE',
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_vote_options" (
    "id" TEXT NOT NULL,
    "voteId" TEXT NOT NULL,
    "optionType" "VoteOptionType" NOT NULL,
    "label" VARCHAR(300) NOT NULL,
    "mapLink" VARCHAR(1000),
    "date" VARCHAR(20),
    "time" VARCHAR(10),
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "chat_vote_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_vote_answers" (
    "id" TEXT NOT NULL,
    "voteId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_vote_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_votes_roomId_status_idx" ON "chat_votes"("roomId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "chat_vote_answers_voteId_optionId_userId_key" ON "chat_vote_answers"("voteId", "optionId", "userId");

-- CreateIndex
CREATE INDEX "chat_vote_answers_voteId_userId_idx" ON "chat_vote_answers"("voteId", "userId");

-- AddForeignKey
ALTER TABLE "chat_votes" ADD CONSTRAINT "chat_votes_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_vote_options" ADD CONSTRAINT "chat_vote_options_voteId_fkey" FOREIGN KEY ("voteId") REFERENCES "chat_votes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_vote_answers" ADD CONSTRAINT "chat_vote_answers_voteId_fkey" FOREIGN KEY ("voteId") REFERENCES "chat_votes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_vote_answers" ADD CONSTRAINT "chat_vote_answers_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "chat_vote_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
