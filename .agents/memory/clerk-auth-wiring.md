---
name: Auth status (Google OAuth, optional)
description: This app uses optional Google OAuth login (passport). Clerk was removed earlier.
---

# Auth: optional Google OAuth (passport)

History: Clerk was fully ripped out first (app became single-user, public routes).
Then the owner added Google OAuth via passport-google-oauth20, adapted from a file
written for a different app. **Auth is OPTIONAL** — the app itself stays fully open;
login only establishes a session + shows the signed-in user. No API routes are gated.

**Why:** the owner wanted their own Google login (explicitly rejected Clerk/Replit Auth),
using their own `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

**How to apply / gotchas:**
- The api-server only receives `/api/*` through the shared proxy, so ALL OAuth routes
  MUST live under `/api/` — login is `/api/auth/google`, callback is
  `/api/auth/google/callback`. A bare `/auth/...` path would never reach the server.
- The Google Cloud OAuth client must have the redirect URI
  `https://<domain>/api/auth/google/callback` registered for every domain (dev preview
  + published `a-1-101.replit.app`), or login fails with redirect_uri_mismatch.
- Session store is connect-pg-simple reusing the `pool` exported from `@workspace/db`
  (table `user_sessions`, auto-created). Secrets: SESSION_SECRET required in production.
- If GOOGLE_CLIENT_ID/SECRET are missing, Google login is silently disabled but the app
  still runs (login button just 404s). Admin/visits analytics from the source file were
  intentionally NOT ported.
- Users table lives in `lib/db/src/schema/users.ts`. drizzle-zod here needs `zod/v4`.
