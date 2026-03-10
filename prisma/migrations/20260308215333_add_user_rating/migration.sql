-- CreateTable
CREATE TABLE "user_ratings" (
    "id" TEXT NOT NULL,
    "matchRequestId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_ratings_toUserId_idx" ON "user_ratings"("toUserId");

-- CreateIndex
CREATE UNIQUE INDEX "user_ratings_matchRequestId_fromUserId_key" ON "user_ratings"("matchRequestId", "fromUserId");

-- AddForeignKey
ALTER TABLE "user_ratings" ADD CONSTRAINT "user_ratings_matchRequestId_fkey" FOREIGN KEY ("matchRequestId") REFERENCES "match_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_ratings" ADD CONSTRAINT "user_ratings_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_ratings" ADD CONSTRAINT "user_ratings_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
