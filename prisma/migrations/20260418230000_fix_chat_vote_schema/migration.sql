-- Fix chat_votes: replace 'type' column with 'title'
ALTER TABLE "chat_votes" DROP COLUMN "type";
ALTER TABLE "chat_votes" ADD COLUMN "title" VARCHAR(200) NOT NULL DEFAULT '';
ALTER TABLE "chat_votes" ALTER COLUMN "title" DROP DEFAULT;

-- Fix chat_vote_options: rename mapUrl -> mapLink, add optionType
ALTER TABLE "chat_vote_options" RENAME COLUMN "mapUrl" TO "mapLink";

-- Create VoteOptionType enum
CREATE TYPE "VoteOptionType" AS ENUM ('PLACE', 'TIME');

-- Add optionType column to chat_vote_options
ALTER TABLE "chat_vote_options" ADD COLUMN "optionType" "VoteOptionType" NOT NULL DEFAULT 'PLACE';
ALTER TABLE "chat_vote_options" ALTER COLUMN "optionType" DROP DEFAULT;

-- Drop deprecated VoteType enum
DROP TYPE "VoteType";
