import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

// Anonymous site-visit tracking (independent of Google logins).
// One row per unique visitor key (hash of IP + user agent).
export const siteVisitsTable = pgTable("site_visits", {
  id: serial("id").primaryKey(),
  visitorKey: text("visitor_key").notNull().unique(),
  hits: integer("hits").notNull().default(1),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type SiteVisit = typeof siteVisitsTable.$inferSelect;
