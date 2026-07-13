---
name: Canonical Google auth (verbatim) & isolation rule
description: Owner-provided canonical Google OAuth file installed verbatim; isolation rule (one backend file, one frontend file); routing and credential gotchas.
---

# Auth: owner's CANONICAL Google OAuth file, installed VERBATIM

The owner deleted all prior auth code and supplied his own known-working
`server/auth.ts`. It now lives at `artifacts/api-server/src/lib/auth.ts`
**verbatim** — only app-specific values (domains, trustedHosts, localhost
port) were changed, plus a `@ts-nocheck` header because this repo's tsconfig
is stricter than his donor project's.

**Why:** repeated forceful orders: do NOT rewrite/regenerate/replace this
file; no Replit Auth, no Clerk, ever. Style issues inside it (console.log,
any-casts, its own pg Pool, createTableIfMissing) are intentional — leave them.

**How to apply / gotchas:**
- Do NOT "fix" or refactor auth.ts. Data access is adapted via
  `lib/storage.ts` (Drizzle adapter implementing the storage API it imports).
- Proxy: api-server artifact.toml paths are `["/api", "/auth"]` so the
  canonical callback path `/auth/google/callback` reaches the server in dev
  and production. Login routes exist at both `/api/auth/google` and
  `/auth/google`; callbacks at both `/auth/google/callback` and
  `/api/auth/google/callback`. Google Console has BOTH variants registered
  for a-1-101.replit.app, www.a-1-101.replit.app, ai101.ink, www.ai101.ink.
  The dev preview domain is NOT registered → login from the dev preview fails
  with redirect_uri_mismatch; that's expected — test on the prod domains.
- Credentials: `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` secrets hold the
  OWNER'S own Google Cloud client (1014755207210-…). The code prefers
  `GOOGLE_LOGIN_CLIENT_ID/SECRET` if ever set. Never swap in Replit-owned
  credentials (wrong consent-screen branding).
- Admin = hardcoded `ADMIN_EMAIL = johnmichaelkuczynski@gmail.com` inside the
  canonical file (this replaced the old env-var/min-id scheme — it is in HIS
  file; do not "restore" the old behavior). Admin endpoint is
  `/api/admin/visits` returning `{stats, series, visits}`.
- Session store: connect-pg-simple with its own pg Pool (NEON_DATABASE_URL ||
  DATABASE_URL), table `user_sessions` (also provisioned by Drizzle schema,
  so createTableIfMissing being a no-op under esbuild is harmless).
  SESSION_SECRET required in production.

**Isolation rule (still in force):** ALL login code in exactly one backend
file (`lib/auth.ts`, plus its `lib/storage.ts` adapter) and one frontend file
(`qr-course/src/auth.tsx`: useAuth, LoginScreen, AuthGate, AuthFooter,
Administrative). `auth.tsx` must NOT import Layout (cycle); Layout/App only
import from it.
