---
name: Google auth gating + Administrative page
description: Durable decisions behind login gating and owner-only analytics in qr-course
---

# Google login gating & Administrative analytics

The whole site **requires** Google login (this reversed an earlier "auth optional /
all routes public" design — don't reintroduce public content routes).

**Decisions / constraints (not derivable from a quick read):**
- Content API routes are gated by a single `isAuthenticated` (exported by the canonical
  `lib/auth.ts`) applied on the shared `/api` router; auth + admin routes are registered
  at the app level *before* that router so they are reachable while logged out. Keeping
  `/api/healthz` public is intentional.
- **Admin = site owner**, hardcoded in the canonical auth file
  (`ADMIN_EMAIL = johnmichaelkuczynski@gmail.com`). The frontend mirrors the same email
  constant to show/hide the Administrative nav + page; the server enforces via `isAdmin`.
- Login analytics are backed by a `login_events` row inserted on every successful Google
  callback; the admin endpoint `/api/admin/visits` returns `{stats, series, visits}` with
  keys last24Hours/lastMonth/lastYear/allTime.

**Gotcha — router path prefix:** every router on the shared `/api` router declares
prefix-less paths (`/course/...`, `/healthz`). Declaring the full `/api/...` path inside
such a router produces a phantom `/api/api/...` route that only fails for authenticated
users (logged-out requests still 401 at the gate, masking it).

**Note:** auth + admin frontend uses raw fetch + React Query, not OpenAPI codegen —
intentional, keeps all login code inside the single `auth.tsx` file.
