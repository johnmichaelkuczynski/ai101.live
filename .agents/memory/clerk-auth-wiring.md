---
name: Auth status (login removed)
description: This app has NO login system — Clerk was ripped out at the user's request
---

# Auth: none

The user explicitly asked to rip out all login. Clerk was fully removed from both
artifacts (frontend `@clerk/react`/`@clerk/themes` + ClerkProvider/SignIn/SignUp/Show
gating, backend `@clerk/express`/`@clerk/shared` + clerkMiddleware + the FAPI proxy
middleware). The app is single-user with all API routes public.

**Why:** the user said they had a plan that required removing any existing login system.

**How to apply:**
- Do NOT re-add auth, ClerkProvider, requireAuth, or sign-in gating unless the user
  explicitly asks. The frontend now renders the app directly at `/` (Dashboard).
- Leftover `VITE_CLERK_*` / `CLERK_*` secrets may still exist in the environment; they
  are unused and harmless — do not wire them back in.
- If auth is ever requested again, use the `clerk-auth` skill from scratch.
