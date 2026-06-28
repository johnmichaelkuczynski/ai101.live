---
name: QuantReason reskin — week/unit labeling
description: How the QuantReason course runtime models "weeks" and where unit labels live, so reskins don't double-prefix labels.
---

# QuantReason reskin: "weeks" are reused as the course's top-level grouping

The QuantReason runtime (and its reskins like AI Logic, Teach Yourself AI) models the
top-level curriculum grouping as `weekNumber` (1–4) everywhere — DB, API overview
(`overview.weeks`), routes (`/weeks/:n`). A reskin that wants "Units" instead of
"Weeks" does NOT rename the data model; it only changes display strings.

**Rule:** the human-readable group label lives entirely in `WEEK_TITLES` in
`api-server/src/routes/course.ts` (e.g. `"Unit 1 — Fundamental Concepts: ..."`). The
frontend must render `week.title` **as-is** — do NOT add a `Week {n}:` or
`Unit {n}:` numeric prefix in the UI, or you get doubled labels like
"Week 1: Unit 1 — ...".

**Why:** `WEEK_TITLES` already embeds the unit number/name. A leftover `Week {n}:`
prefix in Dashboard/Assignments and a literal `Week` table header in Analytics are
the easy-to-miss spots during a reskin.

**How to apply:** when reskinning week→unit, grep changed UI for `\bWeek\b` and the
`week.weekNumber` interpolation in titles; render `week.title` alone and switch any
literal "Week" headers (Analytics table, Assignments group header) to "Unit".
