import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, loginEventsTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

interface Bucket {
  label: string;
  count: number;
}

function countSince(timestamps: number[], sinceMs: number): number {
  return timestamps.filter((t) => t >= sinceMs).length;
}

function bucketByDay(
  timestamps: number[],
  days: number,
  now: number,
): Bucket[] {
  const dayMs = 24 * 60 * 60 * 1000;
  const buckets: Bucket[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const start = new Date(now - i * dayMs);
    start.setHours(0, 0, 0, 0);
    const end = start.getTime() + dayMs;
    const count = timestamps.filter(
      (t) => t >= start.getTime() && t < end,
    ).length;
    buckets.push({
      label: start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      count,
    });
  }
  return buckets;
}

function bucketByHour(timestamps: number[], now: number): Bucket[] {
  const hourMs = 60 * 60 * 1000;
  const buckets: Bucket[] = [];
  for (let i = 23; i >= 0; i--) {
    const start = new Date(now - i * hourMs);
    start.setMinutes(0, 0, 0);
    const end = start.getTime() + hourMs;
    const count = timestamps.filter(
      (t) => t >= start.getTime() && t < end,
    ).length;
    buckets.push({
      label: start.toLocaleTimeString("en-US", { hour: "numeric" }),
      count,
    });
  }
  return buckets;
}

function bucketByMonth(
  timestamps: number[],
  months: number,
  now: number,
): Bucket[] {
  const buckets: Bucket[] = [];
  const nowDate = new Date(now);
  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(nowDate.getFullYear(), nowDate.getMonth() - i, 1);
    const end = new Date(nowDate.getFullYear(), nowDate.getMonth() - i + 1, 1);
    const count = timestamps.filter(
      (t) => t >= start.getTime() && t < end.getTime(),
    ).length;
    buckets.push({
      label: start.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      count,
    });
  }
  return buckets;
}

router.get("/admin/analytics", requireAdmin, async (_req, res) => {
  const events = await db
    .select()
    .from(loginEventsTable)
    .orderBy(desc(loginEventsTable.createdAt));

  const now = Date.now();
  const timestamps = events.map((e) => new Date(e.createdAt).getTime());

  const dayMs = 24 * 60 * 60 * 1000;
  const stats = {
    day: countSince(timestamps, now - dayMs),
    week: countSince(timestamps, now - 7 * dayMs),
    month: countSince(timestamps, now - 30 * dayMs),
    year: countSince(timestamps, now - 365 * dayMs),
    allTime: timestamps.length,
  };

  const series = {
    day: bucketByHour(timestamps, now),
    week: bucketByDay(timestamps, 7, now),
    month: bucketByDay(timestamps, 30, now),
    year: bucketByMonth(timestamps, 12, now),
    allTime: bucketByMonth(timestamps, 12, now),
  };

  const recentLogins = events.slice(0, 200).map((e) => ({
    email: e.email,
    at: new Date(e.createdAt).toISOString(),
  }));

  res.json({ stats, series, recentLogins });
});

export default router;
