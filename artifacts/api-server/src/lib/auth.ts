// ---------------------------------------------------------------------------
// ALL login-related server code lives in this single file:
//   - session store + cookie configuration
//   - Google OAuth 2.0 (passport) strategy and /api/auth/* routes
//   - login-event recording (who logged in, when)
//   - route guards (requireAuth, requireAdmin) and admin (owner) detection
//   - owner-only /api/admin/analytics endpoint (login stats + history)
// The only login-related code outside this file is the one-line
// `router.use(requireAuth)` gate in routes/index.ts and the DB tables in
// lib/db/src/schema/auth.ts.
// ---------------------------------------------------------------------------
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import type { Express, Request, Response, NextFunction } from "express";
import { eq, asc, desc } from "drizzle-orm";
import {
  db,
  pool,
  usersTable,
  loginEventsTable,
  type User,
} from "@workspace/db";
import { logger } from "./logger";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      id: number;
      username: string;
      googleId?: string | null;
      email?: string | null;
      displayName?: string | null;
    }
  }
}

// --- Inline storage layer (Drizzle) ---------------------------------------
async function getUserById(id: number): Promise<User | undefined> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  return user;
}

async function getUserByGoogleId(googleId: string): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.googleId, googleId));
  return user;
}

async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  return user;
}

async function createUserWithGoogle(data: {
  username: string;
  googleId: string;
  email: string | null;
  displayName: string | null;
}): Promise<User> {
  const [user] = await db.insert(usersTable).values(data).returning();
  return user;
}

async function updateUserGoogle(
  id: number,
  data: { googleId?: string; displayName?: string | null },
): Promise<User> {
  const [user] = await db
    .update(usersTable)
    .set(data)
    .where(eq(usersTable.id, id))
    .returning();
  return user;
}

async function recordLoginEvent(
  userId: number,
  email: string | null,
): Promise<void> {
  await db.insert(loginEventsTable).values({ userId, email });
}

// --- Admin (site owner) detection ----------------------------------------
// The owner is either the account whose email matches ADMIN_EMAIL, or — when
// ADMIN_EMAIL is unset — the first account that ever signed in (lowest id).
async function getIsAdmin(user: Express.User): Promise<boolean> {
  const adminEmail = (process.env.ADMIN_EMAIL || "")
    .replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, "")
    .trim()
    .toLowerCase();
  if (adminEmail) {
    return !!user.email && user.email.toLowerCase() === adminEmail;
  }
  const [first] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .orderBy(asc(usersTable.id))
    .limit(1);
  return !!first && first.id === user.id;
}

// --- Route guards ---------------------------------------------------------
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.isAuthenticated() && req.user) {
    next();
    return;
  }
  res.status(401).json({ error: "Authentication required" });
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.isAuthenticated() || !req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  getIsAdmin(req.user)
    .then((ok) => {
      if (ok) {
        next();
      } else {
        res.status(403).json({ error: "Forbidden" });
      }
    })
    .catch((err) => {
      logger.error({ err }, "Admin check failed");
      res.status(500).json({ error: "Admin check failed" });
    });
}

export function setupAuth(app: Express): void {
  // Strip invisible characters (non-breaking spaces, zero-width chars, BOM) and
  // surrounding whitespace that often sneak in when secrets are copy-pasted.
  const sanitizeSecret = (v?: string) =>
    (v || "").replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, "").trim();

  const clientID = sanitizeSecret(
    process.env.GOOGLE_LOGIN_CLIENT_ID ||
      process.env.GOOGLE_OAUTH_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID,
  );
  const clientSecret = sanitizeSecret(
    process.env.GOOGLE_LOGIN_CLIENT_SECRET ||
      process.env.GOOGLE_OAUTH_CLIENT_SECRET ||
      process.env.GOOGLE_CLIENT_SECRET,
  );

  const googleEnabled = !!(clientID && clientSecret);

  if (!googleEnabled) {
    logger.warn(
      "Google OAuth credentials not found (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET). Google login disabled.",
    );
  }

  // Trust proxy for production (behind Replit's shared proxy)
  app.set("trust proxy", 1);

  // Database-backed session store (reuses the shared @workspace/db pool)
  const PgSession = connectPgSimple(session);
  // The session table is provisioned out-of-band (see migrations / setup) —
  // connect-pg-simple's createTableIfMissing reads a bundled table.sql that does
  // not survive esbuild bundling, so we disable it to avoid an ENOENT that would
  // silently prevent sessions (and therefore all logins) from persisting.
  const pgStore = new PgSession({
    pool,
    tableName: "user_sessions",
    createTableIfMissing: false,
    errorLog: (...args: unknown[]) =>
      logger.error({ args }, "Session store error"),
  });

  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && !process.env.SESSION_SECRET) {
    throw new Error(
      "SESSION_SECRET environment variable is required in production",
    );
  }

  app.use(
    session({
      store: pgStore,
      secret: process.env.SESSION_SECRET || "teach-yourself-ai-dev-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction || !!process.env.REPLIT_DEV_DOMAIN,
        httpOnly: true,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      },
    }),
  );

  logger.info(
    { secureCookies: isProduction || !!process.env.REPLIT_DEV_DOMAIN },
    "Session configured",
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    done(null, (user as Express.User).id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await getUserById(id);
      done(null, user ?? false);
    } catch (error) {
      done(error);
    }
  });

  // --- Google OAuth 2.0 (login is REQUIRED: the whole app is gated) --------
  if (googleEnabled) {
    // Callback lives under /api because the shared proxy only routes /api/* to
    // this service. This must match the redirect URI registered in the owner's
    // Google Cloud Console OAuth client.
    const CALLBACK_PATH = "/api/auth/google/callback";

    const getCallbackURL = () => {
      if (process.env.NODE_ENV === "production") {
        const prodDomain = (process.env.REPLIT_DOMAINS || "")
          .split(",")[0]
          ?.trim();
        return `https://${prodDomain || "a-1-101.replit.app"}${CALLBACK_PATH}`;
      }
      if (process.env.REPLIT_DEV_DOMAIN) {
        return `https://${process.env.REPLIT_DEV_DOMAIN}${CALLBACK_PATH}`;
      }
      return `http://localhost:5000${CALLBACK_PATH}`;
    };

    // Build the callback URL from the domain the visitor is actually on, so
    // login works from every registered domain (.replit.app, dev preview).
    // Only known app domains are trusted; anything else falls back to the
    // static default (prevents host-header tampering).
    const trustedHosts = new Set<string>(
      [
        ...(process.env.REPLIT_DOMAINS || "").split(",").map((d) => d.trim()),
        process.env.REPLIT_DEV_DOMAIN || "",
        "a-1-101.replit.app",
        "localhost:5000",
      ]
        .filter(Boolean)
        .map((h) => h.toLowerCase()),
    );

    const getRequestCallbackURL = (req: Request) => {
      const host = (req.headers["x-forwarded-host"] || req.headers.host || "")
        .toString()
        .split(",")[0]
        .trim()
        .toLowerCase();
      if (host && trustedHosts.has(host)) {
        const proto = host.startsWith("localhost") ? "http" : "https";
        return `${proto}://${host}${CALLBACK_PATH}`;
      }
      return getCallbackURL();
    };

    passport.use(
      new GoogleStrategy(
        {
          clientID,
          clientSecret,
          callbackURL: getCallbackURL(),
          state: true, // CSRF protection via session-stored state parameter
          passReqToCallback: false,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value || null;
            const displayName = profile.displayName || null;
            const googleId = profile.id;

            let user = await getUserByGoogleId(googleId);

            if (!user) {
              if (email) {
                user = await getUserByEmail(email);
              }

              if (!user) {
                const username =
                  email?.split("@")[0] || `user_${googleId.substring(0, 8)}`;
                user = await createUserWithGoogle({
                  username,
                  googleId,
                  email,
                  displayName,
                });
                logger.info(
                  { userId: user.id, username: user.username },
                  "Google OAuth: created new user",
                );
              } else {
                user = await updateUserGoogle(user.id, {
                  googleId,
                  displayName,
                });
              }
            } else {
              user = await updateUserGoogle(user.id, { displayName });
            }

            logger.info({ userId: user.id }, "Google OAuth: login successful");
            done(null, user);
          } catch (error) {
            logger.error({ err: error }, "Google auth error");
            done(error as Error);
          }
        },
      ),
    );

    // Click 1: button links here -> 302 straight to Google's account chooser.
    // callbackURL is computed per request so login works from every domain.
    const loginHandler = (
      req: Request,
      res: import("express").Response,
      next: import("express").NextFunction,
    ) =>
      passport.authenticate("google", {
        scope: ["openid", "email", "profile"],
        prompt: "select_account",
        callbackURL: getRequestCallbackURL(req),
      } as passport.AuthenticateOptions)(req, res, next);
    app.get("/api/auth/google", loginHandler);

    // Click 2 happens on Google; the callback lands the user inside the app.
    app.get(
      CALLBACK_PATH,
      (req, res, next) =>
        passport.authenticate("google", {
          failureRedirect: "/?error=auth_failed",
          callbackURL: getRequestCallbackURL(req),
        } as passport.AuthenticateOptions)(req, res, next),
      (req, res) => {
        if (req.user) {
          recordLoginEvent(req.user.id, req.user.email ?? null).catch((err) =>
            logger.error({ err }, "Failed to record login event"),
          );
        }
        req.session.save(() => {
          res.redirect("/");
        });
      },
    );

    logger.info(
      { callbackURL: getCallbackURL() },
      "Google OAuth configured",
    );
  } else {
    // Keep the login route registered so the UI gets a clear error instead of a
    // confusing 404 when Google credentials are not configured.
    app.get("/api/auth/google", (_req, res) => {
      res.status(503).json({ error: "Google login is not configured" });
    });
  }

  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated() && req.user) {
      const u = req.user;
      getIsAdmin(u)
        .then((isAdmin) => {
          res.json({
            authenticated: true,
            user: {
              id: u.id,
              username: u.username,
              email: u.email,
              displayName: u.displayName,
              isAdmin,
            },
          });
        })
        .catch((err) => {
          logger.error({ err }, "Failed to resolve admin status");
          res.json({
            authenticated: true,
            user: {
              id: u.id,
              username: u.username,
              email: u.email,
              displayName: u.displayName,
              isAdmin: false,
            },
          });
        });
    } else {
      res.json({ authenticated: false, user: null });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated() && req.user) {
      res.json({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        displayName: req.user.displayName,
      });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        res.status(500).json({ error: "Logout failed" });
        return;
      }
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ success: true });
      });
    });
  });

  // --- Owner-only login analytics (/api/admin/analytics) -------------------
  // Registered at the app level (full path) alongside the auth routes so that
  // every piece of login-related routing lives in this file.
  app.get("/api/admin/analytics", requireAdmin, async (_req, res) => {
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
}

// --- Login-analytics bucketing helpers -------------------------------------
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
