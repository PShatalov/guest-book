import {
  pgTable,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id),
  text: varchar('text', { length: 240 }).notNull(),
  categoryTag: varchar('category_tag', { length: 32 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type MessageRecord = typeof messages.$inferSelect;
export type NewMessageRecord = typeof messages.$inferInsert;

export const messageBookmarks = pgTable(
  'message_bookmarks',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    messageId: uuid('message_id')
      .notNull()
      .references(() => messages.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'message_bookmarks_user_id_message_id_pk',
      columns: [table.userId, table.messageId],
    }),
  ],
);

export type MessageBookmarkRecord = typeof messageBookmarks.$inferSelect;
export type NewMessageBookmarkRecord = typeof messageBookmarks.$inferInsert;
