---
name: Open access + free AI quota
description: How the login wall removal / anonymous free-preview quota works and its pitfalls
---
- Site is fully public; login only forced when an anonymous session exceeds ~1500 chars of AI-generated output. Enforced by `freeQuota` in api-server `lib/access.ts`; over quota → 401 `{code:"LOGIN_REQUIRED"}`; frontend pops a Google sign-in dialog via a `app:login-required` window event (all login UI still lives in qr-course `src/auth.tsx`).
- **Only POSTs matching an explicit AI-generation path allowlist are metered** — GET browsing and non-AI POSTs (start assignment) must never consume quota. Update the allowlist in access.ts when adding AI endpoints.
- Diagnostics are admin-only server-side, EXCEPT single-lecture expand (`POST /diagnostics/expand-lectures?id=N`) which is open to any signed-in user (used by LectureView depth switching).
- Unique visitors tracked in `site_visits` table (hash of IP+UA, once per session); owner-only `/api/admin/unique-visitors` registered in app.ts (never in canonical auth.ts). **Why:** owner wanted a visitor count only they can see.
- **How to apply:** new schema tables need a drizzle push to production at publish time or the admin visitors endpoint 500s in prod.
