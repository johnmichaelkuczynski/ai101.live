// ---------------------------------------------------------------------------
// ALL login-related database tables live in this single file.
// ---------------------------------------------------------------------------
import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  json,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

// One row per successful Google sign-in (who logged in, and when).
export const loginEventsTable = pgTable("login_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type LoginEvent = typeof loginEventsTable.$inferSelect;

// Session store table for connect-pg-simple. Defined here (rather than relying
// on connect-pg-simple's createTableIfMissing, which reads a bundled table.sql
// that does not survive esbuild bundling) so `db push` provisions it in every
// environment. Column shape must match connect-pg-simple's expectations.
export const userSessionsTable = pgTable(
  "user_sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire", { precision: 6 }).notNull(),
  },
  (t) => [index("IDX_user_sessions_expire").on(t.expire)],
);
