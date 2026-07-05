---
name: Auth approach — canonical Passport/Google OAuth, verbatim
description: History of auth in this app and the strict rules around the current auth.ts
---
# Auth in this app

- Clerk was fully removed at the user's demand (July 2026). Do not reintroduce Clerk. Leftover CLERK_* secrets are unused and harmless.
- Current auth: the user's own canonical `server/auth.ts` (Passport + Google OAuth + express-session + connect-pg-simple), installed VERBATIM into the api-server.

**Rules (user-mandated):**
- Do NOT rewrite, refactor, or substitute this auth file. Only domain-specific values may differ from the user's canonical copy (callback fallback domain, trustedHosts, localhost port).
- `console.log`/`console.warn` in auth.ts are intentional — the verbatim order overrides the repo's no-console rule.
- Login is OPTIONAL: the app stays fully open; never gate routes behind isAuthenticated.

**Why:** the user maintains one canonical auth file across all their apps and wants byte-level consistency; unrequested "improvements" to auth wiring have broken sign-in before.

**How to apply:** any future auth change must be a minimal diff against the canonical file, with every changed line reported to the user. Secrets: GOOGLE_LOGIN_CLIENT_ID / GOOGLE_LOGIN_CLIENT_SECRET. The api-server proxy paths include `/auth` so `/auth/google/callback` reaches it. Admin email johnmichaelkuczynski@gmail.com gates /api/admin/visits.
