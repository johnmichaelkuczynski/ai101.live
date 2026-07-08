---
name: connect-pg-simple session table under esbuild
description: Why session persistence silently breaks in a bundled api-server
---

# connect-pg-simple `createTableIfMissing` breaks under esbuild bundling

`connect-pg-simple`'s `createTableIfMissing: true` reads a `table.sql` file relative to
its own module. After the api-server is bundled with esbuild into a single file, that
asset isn't present, so the store throws `ENOENT ... table.sql` on first query. The error
is only logged (not fatal), so the session table is never created and **sessions never
persist** — logins appear to work (redirects fire) but nothing is stored/read.

**Why it matters:** once the whole site is gated behind login, a broken session store
makes the entire app inaccessible, and the failure is silent (boot + redirects succeed).

**How to apply:**
- Provision the session table via Drizzle (`db push` covers dev + prod) instead of relying
  on the store, and set `createTableIfMissing: false`.
- The session cookie is `secure` (HTTPS-only): testing over plain `localhost:80` returns
  no `Set-Cookie`. Test via `https://$REPLIT_DEV_DOMAIN` (proxy sets `X-Forwarded-Proto`
  and `trust proxy` makes `req.secure` true). This is expected, not a bug.
- Forging a session for testing requires the real `SESSION_SECRET` to sign the cookie;
  it's a hidden secret, so don't try to reproduce it — verify via the live OAuth flow.
