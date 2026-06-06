---
name: Clerk auth wiring (qr-course + api-server)
description: Why the Clerk integration is wired the way it is; what NOT to "fix".
---

# Clerk-managed auth for Teach Yourself AI

Auth is Replit-managed Clerk (clerk-auth skill), added to the previously single-user app.

## Canonical wiring is copied VERBATIM from the clerk-auth skill — do not "harden" it
- `app.use(cors({ credentials: true, origin: true }))` in api-server `app.ts` is the skill's
  prescribed config (setup-and-customization.md). A code review will flag it as permissive CORS.
  **Leave it.** The web app is same-origin through the Replit proxy (localhost:80 in dev, the
  .replit.app/custom domain in prod); origin:true is needed for the Clerk cross-origin proxy auth
  flow. Diverging risks breaking sign-in.
- Do NOT add NODE_ENV / PROD gates around the Clerk middleware or proxy.
- Web auth is cookie-based, same-origin. Do NOT add getToken/Bearer headers to web fetches.

## Structure
- Server gate: `clerkMiddleware` mounted before `/api`; `requireAuth` in routes/index.ts is global
  AFTER healthRouter, so `/api/healthz` is public and every data router returns 401 without a userId.
  `requireAuth` uses `getAuth(req).userId` only (sessionClaims?.userId is typed `{}` → TS error).
- Client: ClerkProvider in App.tsx; signed-out → public Landing page; signed-in → AppRoutes.
  sign-in/sign-up use wildcard routes (`/sign-in/*?`, `/sign-up/*?`) for the OAuth callback.
- DB data is intentionally NOT user-scoped (out of scope for the "add Google login" task).

**Why:** the skill is the authoritative source for this exact integration; a generic code review
does not know about the proxy/cookie architecture the skill is designed around.
