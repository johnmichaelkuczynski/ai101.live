---
name: Auth removed
description: The app deliberately has no login system; user removed Clerk on purpose and has a follow-up plan.
---

This app intentionally has no authentication. The user explicitly ordered all login (Clerk) removed and has an unspecified follow-up plan that requires a clean, auth-free app.

**Why:** Explicit user demand ("rip out all existing login — I have a plan"). Single-user app; open API routes are a deliberate posture, not an accidental bypass.

**How to apply:** Do not re-introduce Clerk or any auth system without the user asking. Leftover CLERK_* / VITE_CLERK_* secrets in the environment are unused and harmless. Treat public /api routes as intended.
