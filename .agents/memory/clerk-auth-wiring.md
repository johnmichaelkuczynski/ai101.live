---
name: Google auth wiring & isolation rule
description: Required Google login (passport) with all login code isolated to one backend file and one frontend file; OAuth route/redirect gotchas.
---

# Auth: REQUIRED Google OAuth (passport), fully isolated

Current state: login is REQUIRED for the whole site. All content routes are
gated (`routes/index.ts` has a single `router.use(requireAuth)`); only
`/api/healthz` and the auth routes are public. Clerk was removed long ago.

**Isolation rule (user demand, repeated forcefully):** ALL login-related code
must live in exactly one backend file (`artifacts/api-server/src/lib/auth.ts`,
including the owner-only `/api/admin/analytics` route) and one frontend file
(`artifacts/qr-course/src/auth.tsx`: useAuth, LoginScreen, AuthGate,
AuthFooter, Administrative page). Do not scatter auth logic into other files;
Layout/App only import from these. `auth.tsx` must NOT import Layout (the
router wraps Administrative in Layout) to avoid an import cycle.

**Why:** the owner issued explicit "cease and desist"-style orders to isolate
login code after auth changes bled into multiple files.

**How to apply / gotchas:**
- The api-server only receives `/api/*` through the shared proxy, so ALL OAuth
  routes MUST live under `/api/` — login `/api/auth/google`, callback
  `/api/auth/google/callback`. A bare `/auth/...` path never reaches the server.
- The Google Cloud OAuth client must have redirect URI
  `https://<domain>/api/auth/google/callback` registered for every domain
  (dev preview + published `a-1-101.replit.app`) or login fails with
  redirect_uri_mismatch.
- Current GOOGLE_CLIENT_ID/SECRET belong to a Replit-owned OAuth client, so the
  consent screen says "signing back in to Replit". The owner wants their OWN
  branding — fixing it requires their own Google Cloud OAuth client creds.
  Do NOT suggest Replit Auth (explicitly rejected).
- Session store is connect-pg-simple reusing `pool` from `@workspace/db`
  (Drizzle-managed `user_sessions` table in `lib/db/src/schema/auth.ts`, which
  also holds `login_events`). SESSION_SECRET required in production.
- Admin = ADMIN_EMAIL env var, else the minimum-id user.
