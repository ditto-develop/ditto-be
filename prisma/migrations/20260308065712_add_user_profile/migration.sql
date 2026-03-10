/*
  Warnings:

  - A unique constraint covering the columns `[year,month,week,category]` on the table `quiz_sets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `quiz_answers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MatchingType" AS ENUM ('ONE_TO_ONE', 'GROUP');

-- CreateEnum
CREATE TYPE "QuizProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- DropIndex
DROP INDEX "quiz_sets_week_category_key";

-- AlterTable
ALTER TABLE "quiz_answers" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "quiz_sets" ADD COLUMN     "matchingType" "MatchingType" NOT NULL DEFAULT 'ONE_TO_ONE',
ADD COLUMN     "month" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN     "year" INTEGER NOT NULL DEFAULT 2025;

-- CreateTable
CREATE TABLE "user_quiz_progresses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL DEFAULT 2025,
    "month" INTEGER NOT NULL DEFAULT 12,
    "week" INTEGER NOT NULL,
    "quizSetId" TEXT NOT NULL,
    "status" "QuizProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_quiz_progresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "introduction" VARCHAR(300),
    "preferredMinAge" INTEGER,
    "preferredMaxAge" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_quiz_progresses_userId_year_month_week_key" ON "user_quiz_progresses"("userId", "year", "month", "week");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_sets_year_month_week_category_key" ON "quiz_sets"("year", "month", "week", "category");

-- AddForeignKey
ALTER TABLE "user_quiz_progresses" ADD CONSTRAINT "user_quiz_progresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quiz_progresses" ADD CONSTRAINT "user_quiz_progresses_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "quiz_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
