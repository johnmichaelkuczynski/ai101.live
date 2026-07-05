import { desc, eq, gte } from "drizzle-orm";
import { db, usersTable, visitsTable, type User, type Visit } from "@workspace/db";

export const storage = {
  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return user;
  },

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.googleId, googleId));
    return user;
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    return user;
  },

  async createUserWithGoogle(data: {
    username: string;
    googleId: string;
    email: string | null;
    displayName: string | null;
  }): Promise<User> {
    const [user] = await db.insert(usersTable).values(data).returning();
    if (!user) throw new Error("Failed to create user");
    return user;
  },

  async updateUserGoogle(
    id: number,
    data: { googleId?: string; displayName?: string | null },
  ): Promise<User> {
    const [user] = await db
      .update(usersTable)
      .set(data)
      .where(eq(usersTable.id, id))
      .returning();
    if (!user) throw new Error(`User ${id} not found`);
    return user;
  },

  async recordVisit(userId: number, email: string | null): Promise<void> {
    await db.insert(visitsTable).values({ userId, email });
  },

  async getVisits(limit: number): Promise<Visit[]> {
    return db
      .select()
      .from(visitsTable)
      .orderBy(desc(visitsTable.visitedAt))
      .limit(limit);
  },

  async getVisitTimestampsSince(since: Date | null): Promise<Date[]> {
    const rows = since
      ? await db
          .select({ visitedAt: visitsTable.visitedAt })
          .from(visitsTable)
          .where(gte(visitsTable.visitedAt, since))
      : await db.select({ visitedAt: visitsTable.visitedAt }).from(visitsTable);
    return rows.map((r) => r.visitedAt);
  },
};
