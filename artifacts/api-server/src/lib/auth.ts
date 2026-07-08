import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import type { Express, Request } from "express";
import { eq } from "drizzle-orm";
import { db, pool, usersTable, type User } from "@workspace/db";
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
  const pgStore = new PgSession({
    pool,
    tableName: "user_sessions",
    createTableIfMissing: true,
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

  // --- Google OAuth 2.0 (optional login: the app itself is fully open) -----
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
      res.json({
        authenticated: true,
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          displayName: req.user.displayName,
        },
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
}
