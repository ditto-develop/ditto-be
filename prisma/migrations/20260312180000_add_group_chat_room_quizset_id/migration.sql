-- AlterTable
ALTER TABLE "chat_rooms" ADD COLUMN "quizSetId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "chat_rooms_quizSetId_key" ON "chat_rooms"("quizSetId");

-- AddForeignKey
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "quiz_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
