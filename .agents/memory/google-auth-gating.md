---
name: Google auth gating + Administrative page
description: Durable decisions behind login gating and owner-only analytics in qr-course
---

# Google login gating & Administrative analytics

The whole site **requires** Google login (this reversed an earlier "auth optional /
all routes public" design — don't reintroduce public content routes).

**Decisions / constraints (not derivable from a quick read):**
- Content API routes are gated by a single `requireAuth` applied on the shared `/api`
  router; auth routes must stay registered at the app level *before* that router so they
  are reachable while logged out. Keeping `/api/healthz` public is intentional.
- **Admin = site owner**, resolved as: `ADMIN_EMAIL` env match, else the first account
  ever created (lowest `users.id`). First person to sign in on a fresh deployment becomes
  admin. `isAdmin` gates both the sidebar nav item and the Administrative page.
- Login analytics are backed by a `login_events` row inserted on every successful Google
  callback; the admin endpoint aggregates day/week/month/year/all-time.

**Gotcha — router path prefix:** every router on the shared `/api` router declares
prefix-less paths (`/course/...`, `/healthz`, `/admin/analytics`). Declaring the full
`/api/...` path inside such a router produces a phantom `/api/api/...` route that only
fails for authenticated users (logged-out requests still 401 at the gate, masking it).

**Note:** admin analytics uses raw fetch + React Query (like `useAuth`), not OpenAPI
codegen — intentional, consistent with the auth feature.
