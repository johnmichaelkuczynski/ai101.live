// ---------------------------------------------------------------------------
// Public-access support (login wall removed):
//   - trackVisitor: records every unique visitor (hash of IP+UA), so the
//     owner-only Administrative page can show a true unique-visitor count.
//   - freeQuota: lets anonymous visitors sample AI features. Once a session
//     has received more than FREE_CHAR_LIMIT characters of AI-generated
//     output (~two paragraphs), further AI requests return 401 with
//     code "LOGIN_REQUIRED" until the user signs in with Google.
// This file deliberately does NOT touch the canonical auth.ts.
// ---------------------------------------------------------------------------
import crypto from "node:crypto";
import type { Request, RequestHandler, Response } from "express";
import { sql, eq, count } from "drizzle-orm";
import { db, siteVisitsTable } from "@workspace/db";

declare module "express-session" {
  interface SessionData {
    aiChars?: number;
    visitTracked?: boolean;
  }
}

// ~two paragraphs of generated text.
export const FREE_CHAR_LIMIT = 1500;

function visitorKeyFor(req: Request): string {
  const ip =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
    req.ip ||
    "unknown";
  const ua = req.headers["user-agent"] ?? "unknown";
  return crypto.createHash("sha256").update(`${ip}|${ua}`).digest("hex");
}

export const trackVisitor: RequestHandler = (req, _res, next) => {
  // Only once per session to keep DB writes minimal.
  if (req.session && !req.session.visitTracked) {
    req.session.visitTracked = true;
    const key = visitorKeyFor(req);
    db.insert(siteVisitsTable)
      .values({ visitorKey: key })
      .onConflictDoUpdate({
        target: siteVisitsTable.visitorKey,
        set: {
          hits: sql`${siteVisitsTable.hits} + 1`,
          lastSeenAt: new Date(),
        },
      })
      .catch((err) => req.log?.warn({ err }, "visitor tracking failed"));
  }
  next();
};

/** Sum the length of every string value in a JSON payload. */
function countChars(value: unknown): number {
  if (typeof value === "string") return value.length;
  if (Array.isArray(value)) return value.reduce<number>((n, v) => n + countChars(v), 0);
  if (value && typeof value === "object") {
    return Object.values(value).reduce<number>((n, v) => n + countChars(v), 0);
  }
  return 0;
}

// Only these endpoints actually produce AI-generated output. Browsing
// (GET requests, starting an assignment, etc.) never consumes quota.
const AI_GENERATION_PATHS: RegExp[] = [
  /^\/tutor\/ask/,
  /^\/practice\/sessions/,
  /^\/detection\//,
  /^\/assessments\/(start|custom)/,
  /\/submit$/, // AI grading of assignment & assessment submissions
];

function isAiGeneration(req: Request): boolean {
  return req.method === "POST" && AI_GENERATION_PATHS.some((r) => r.test(req.path));
}

export const freeQuota: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  if (!isAiGeneration(req)) return next();

  // Policy: the cap is checked before each AI call, so a single response may
  // overshoot the limit once — after that, every further AI request is blocked.
  const used = req.session?.aiChars ?? 0;
  if (used >= FREE_CHAR_LIMIT) {
    res.status(401).json({
      error: "Sign in with Google to keep going — you've used up the free preview.",
      code: "LOGIN_REQUIRED",
    });
    return;
  }

  // Count generated output as it goes out so the cap is enforced next time.
  const origJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    if (res.statusCode < 400 && req.session) {
      req.session.aiChars = (req.session.aiChars ?? 0) + countChars(body);
    }
    return origJson(body);
  }) as Response["json"];

  next();
};

/** Owner-only stats: unique visitors (all traffic, not just logins). */
export async function uniqueVisitorsHandler(_req: Request, res: Response): Promise<void> {
  try {
    const [row] = await db.select({ n: count() }).from(siteVisitsTable);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const rows = await db
      .select({ lastSeenAt: siteVisitsTable.lastSeenAt, firstSeenAt: siteVisitsTable.firstSeenAt })
      .from(siteVisitsTable);
    res.json({
      uniqueVisitors: row?.n ?? 0,
      last24Hours: rows.filter((r) => r.lastSeenAt >= dayAgo).length,
      lastMonth: rows.filter((r) => r.lastSeenAt >= monthAgo).length,
    });
  } catch {
    res.status(500).json({ error: "Failed to load unique visitor data" });
  }
}
