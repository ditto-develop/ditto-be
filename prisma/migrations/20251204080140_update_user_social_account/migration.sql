-- AlterTable
CREATE SEQUENCE user_social_accounts_id_seq;
ALTER TABLE "user_social_accounts" ALTER COLUMN "id" SET DEFAULT nextval('user_social_accounts_id_seq'),
ADD CONSTRAINT "user_social_accounts_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE user_social_accounts_id_seq OWNED BY "user_social_accounts"."id";
