CREATE MATERIALIZED VIEW IF NOT EXISTS "message_feed" AS
SELECT
  m."id",
  m."text",
  m."category_tag",
  u."username" AS "author_username",
  m."created_at"
FROM "messages" m
INNER JOIN "users" u ON m."author_id" = u."id"
WITH NO DATA;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "message_feed_id_unique" ON "message_feed" ("id");
--> statement-breakpoint
REFRESH MATERIALIZED VIEW "message_feed";
