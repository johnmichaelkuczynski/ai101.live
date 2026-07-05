---
name: Diagnostic Assessments credit & generation
description: Rules behind the completion-credit assessment feature in qr-course (Teach Yourself AI)
---

# Diagnostic Assessments

A separate assessment system layered on the QuantReason runtime. 7 fixed slots × 4 formats (MC, Written, Hybrid, Official). Only Official counts toward grade.

## Completion = credit (NOT correctness)
- Credit is `distinctCompletedOfficialSlots / 7 * 20` (max 20% of grade). Correctness does NOT affect credit.
- **Why:** the requirement is explicitly completion-based. But "completion" must mean every question answered, not merely "submitted" — otherwise a learner submits blank officials and gets full credit.
- **How to apply:** the submit route rejects (400 `incomplete`) any attempt with one or more blank answers, so a `submitted` attempt always means fully answered. Do not loosen this without a replacement completion gate.

## Fresh questions each retake
- Every start/retake generates NEW AI questions (random nonce in the generator prompt). Retakes are expected and intended.

## Format composition is enforced, not best-effort
- Each format has a fixed MC/written count. The generator validates the LLM output, accumulates across up to 3 retries to hit exact counts per type, trims extras, and throws if still short.
- **Why:** the LLM does not reliably return the exact requested split; without enforcement, a persisted Official could have the wrong number/mix of questions.

## Single-user
- Attempts have NO userId — consistent with the rest of this app (single-user, no auth). Don't add per-user scoping unless the whole app moves to multi-user.

## Answer state non-leak
- The in-progress attempt payload excludes correctAnswer/explanation; those only appear in the submit result. Keep it that way.
