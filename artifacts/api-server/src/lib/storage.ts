// ---------------------------------------------------------------------------
// Storage adapter for the canonical auth implementation (lib/auth.ts).
// Implements the user + visit persistence functions that auth.ts expects,
// backed by this app's Drizzle tables (users, login_events).
// ---------------------------------------------------------------------------
import { db, usersTable, loginEventsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import type { User } from "@workspace/db";

export const storage = {
  async getUserById(id: number): Promise<User | undefined> {
    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    return rows[0];
  },

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.googleId, googleId))
      .limit(1);
    return rows[0];
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);
    return rows[0];
  },

  async createUserWithGoogle(data: {
    username: string;
    googleId: string;
    email: string | null;
    displayName: string | null;
  }): Promise<User> {
    const rows = await db.insert(usersTable).values(data).returning();
    return rows[0];
  },

  async updateUserGoogle(
    id: number,
    data: { googleId?: string; displayName?: string | null },
  ): Promise<User> {
    const rows = await db
      .update(usersTable)
      .set(data)
      .where(eq(usersTable.id, id))
      .returning();
    return rows[0];
  },

  async recordVisit(userId: number, email: string | null): Promise<void> {
    await db.insert(loginEventsTable).values({ userId, email });
  },

  async getVisits(
    limit: number,
  ): Promise<{ id: number; email: string | null; visitedAt: Date }[]> {
    const rows = await db
      .select()
      .from(loginEventsTable)
      .orderBy(desc(loginEventsTable.createdAt))
      .limit(limit);
    return rows.map((r) => ({
      id: r.id,
      email: r.email,
      visitedAt: r.createdAt,
    }));
  },

  async getVisitTimestampsSince(since: Date | null): Promise<Date[]> {
    const rows = await db
      .select({ createdAt: loginEventsTable.createdAt })
      .from(loginEventsTable);
    if (since === null) return rows.map((r) => r.createdAt);
    return rows
      .map((r) => r.createdAt)
      .filter((t) => t.getTime() >= since.getTime());
  },
};
