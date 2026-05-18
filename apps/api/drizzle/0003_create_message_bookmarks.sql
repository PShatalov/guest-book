CREATE TABLE IF NOT EXISTS "message_bookmarks" (
  "user_id" uuid NOT NULL,
  "message_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "message_bookmarks_user_id_message_id_pk" PRIMARY KEY ("user_id", "message_id")
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "pg_constraint" WHERE "conname" = 'message_bookmarks_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "message_bookmarks" ADD CONSTRAINT "message_bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "pg_constraint" WHERE "conname" = 'message_bookmarks_message_id_messages_id_fk'
  ) THEN
    ALTER TABLE "message_bookmarks" ADD CONSTRAINT "message_bookmarks_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
