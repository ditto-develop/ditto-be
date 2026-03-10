-- CreateEnum
CREATE TYPE "MatchRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "match_requests" (
    "id" TEXT NOT NULL,
    "quizSetId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "status" "MatchRequestStatus" NOT NULL DEFAULT 'PENDING',
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreBreakdown" JSONB,
    "algorithmVersion" TEXT NOT NULL DEFAULT 'v1',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "match_requests_fromUserId_status_idx" ON "match_requests"("fromUserId", "status");

-- CreateIndex
CREATE INDEX "match_requests_toUserId_status_idx" ON "match_requests"("toUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "match_requests_quizSetId_fromUserId_toUserId_key" ON "match_requests"("quizSetId", "fromUserId", "toUserId");

-- AddForeignKey
ALTER TABLE "match_requests" ADD CONSTRAINT "match_requests_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "quiz_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_requests" ADD CONSTRAINT "match_requests_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_requests" ADD CONSTRAINT "match_requests_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
