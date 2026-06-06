# Teach Yourself AI — App Blueprint

A complete architectural blueprint for the *Teach Yourself AI* 4-week course. This document is the single reference for what the app does, how it's wired, and the contracts between pieces. For day-to-day commands and gotchas see `replit.md`; for the user-facing overview see `README.md`.

---

## 1. Product summary

Teach Yourself AI is a self-paced, single-user, no-login web course that explains *the ideas behind artificial intelligence* — what AI is, how machines learn, how neural networks and generative models work, and how to use AI responsibly — in plain English, with no math or coding prerequisites. Each micro-lecture introduces one concept, grounds it in a real-world example, and asks the student to explain the idea *in their own words* as a short conceptual answer.

It is a content reskin of the **QuantReason** runtime, which is preserved unchanged: lectures at three depths, a section-scoped AI tutor, adaptive practice, AI-graded assignments, two-layer AI-authorship detection, and one-click diagnostics.

The product surface is three deployable artifacts in one pnpm monorepo:

| Artifact | Slug | Role |
| --- | --- | --- |
| `@workspace/api-server` | `api-server` | Express 5 API mounted at `/api`. Owns the DB, OpenAI calls, AI detection, grading, diagnostics. |
| `@workspace/qr-course` | `qr-course` | Student-facing React + Vite app. The actual course. |
| `@workspace/qr-course-demo` | `qr-course-demo` | A narrated screencast-style product demo video, exported as MP4 from the preview pane. |

Shared contracts live in `lib/`:

- `lib/api-spec` — OpenAPI source of truth.
- `lib/api-zod` — generated Zod validators (used by the server).
- `lib/api-client-react` — generated React Query hooks (used by `qr-course`).
- `lib/db` — Drizzle schema + db client.

---

## 2. Curriculum (the ideas)

Source: `artifacts/api-server/src/lib/seed.ts`. **28 micro-lectures** across four weeks (7 / 6 / 7 / 8). Each lecture teaches exactly one concept, anchors it in a real-world example, and ships a short-answer conceptual question the student answers in plain English.

| Week | Theme | Lectures | Concepts covered |
| --- | --- | --- | --- |
| 1 | What AI is and how it got here | 7 | What AI is and isn't (automation vs. intelligence) · a brief history from symbolic AI to machine learning · rules vs. learning · data as raw material · what "training" means · models as input-output functions · AI in everyday life |
| 2 | How machines learn | 6 | Pattern recognition · features & representations · supervised learning from labels · unsupervised learning (finding structure) · prediction, classification & error (precision/recall) · why more data and bigger models help |
| 3 | Neural networks and generative AI | 7 | Intuition behind neural networks · how networks learn (loss, backpropagation, gradient descent) · from neural nets to deep learning · language models & next-token prediction · what "generative" means · prompting · strengths, limits & hallucination |
| 4 | AI in the world: ethics, safety, and the future | 8 | Bias, fairness & data quality · reliability, evaluation & trust · privacy & security · automation, work & the economy · alignment & AI safety basics · a practical workflow for using AI well · the near future of agents · capstone synthesis |

Assignment shape: 2 homeworks per week plus a graded checkpoint at the end of each week — a Week 1 test, the midterm at the end of Week 2, a Week 3 test, and the cumulative final at the end of Week 4 — **12 assignments total**. Each problem prompt is one conceptual question (define a term, draw a distinction, explain why something works, identify an example) the student answers in their own words.

---

## 3. Domain model (Postgres + Drizzle)

Source: `lib/db/src/schema/course.ts`.

```
topics ──< lectures              (one topic, one lecture per length)
topics ──< problems              (problems tagged to a topic for analytics)
assignments ──< problems         (homework / test / midterm / final)
assignments ──< attempts ──< answers
                                ↑ per-answer keystroke trace + AI scores
practice_sessions ──< practice_problems ──< practice_attempts
                                            ↑ adaptive difficulty session
```

Notable columns:

- `lectures.body` / `body_medium` / `body_long` — the Short / Medium / Long toggle is three pre-baked LLM rewrites of the same lecture. Only `body` is seeded; the on-demand `expand-lectures` job fills in the longer two.
- `answers.{keystrokeCount,eraseCount,bulkInsertCount,longestBulkInsertChars,rewriteSegments,durationMs}` — the **diachronic trace**, captured client-side from the textarea and submitted with the answer.
- `answers.{aiScore,aiFlagged,diachronicScore,diachronicFlagged,detectionRationale}` — frozen detection outcome at submission time.
- `practice_sessions.difficulty` (1–5, double) — adapts session-by-session based on streaks / accuracy.

Push schema with `pnpm --filter @workspace/db run push`.

### 3.1 Curriculum-swap reseed

`seedIfEmpty` maintains an `EXPECTED_TOPIC_SLUGS` set and a `REVISION_SENTINEL` constant (sentinel slug + a phrase that must appear in that lecture's body). On boot it compares the set of seeded topic slugs to the expected set, **and** verifies the sentinel phrase appears in the designated lecture:

- If both match: do nothing.
- If either differs (or the table is empty): wipe attempts, answers, practice, problems, assignments, lectures, topics in dependency order, then re-seed the full curriculum.

This is what lets a single content swap (e.g. swapping the conceptual-math curriculum out for the AI one) propagate cleanly on the next server start, without manual DB surgery.

---

## 4. API surface (OpenAPI-first)

Source: `lib/api-spec/openapi.yaml`. **Never** hand-edit `lib/api-zod/src/generated/*` or `lib/api-client-react/src/generated/*` — change the spec and run `pnpm --filter @workspace/api-spec run codegen`.

| Tag | Endpoints | Purpose |
| --- | --- | --- |
| `course` | `GET /course/overview`, `GET /course/weeks/{n}`, `GET /course/lectures/{id}` | Read the static course tree. Lectures return Short/Medium/Long bodies. |
| `tutor` | `POST /tutor/ask` (SSE), `GET /tutor/suggestions/{lectureId}` | Streaming AI tutor scoped to a lecture section. Suggestions are pre-generated starter questions. |
| `practice` | `POST /practice/sessions`, `POST /practice/sessions/{id}/next`, `POST /practice/sessions/{id}/attempts` | Adaptive practice: server generates the next conceptual problem, scoring it adjusts session `difficulty`. |
| `assignments` | `GET /assignments`, `GET /assignments/{id}`, `POST /assignments/{id}/attempt`, `PUT /assignments/{id}/attempts/{aid}/answers/{pid}`, `POST /assignments/{id}/attempts/{aid}/submit` | Homework / test flow. Submit triggers AI grade + detection per answer. |
| `analytics` | `GET /analytics/summary`, `GET /analytics/topics`, `GET /analytics/activity` | KPIs, topic mastery, recent activity. |
| `detection` | `POST /detection/scan` | Run AI + diachronic detection on an arbitrary text + trace. Used by the diagnostics page. |
| `diagnostics` | `GET /diagnostics/system`, `POST /diagnostics/synthetic-run`, `POST /diagnostics/content-audit`, `POST /diagnostics/expand-lectures`, `POST /diagnostics/reset` | Self-tests and seed maintenance. See §8. |

The submit endpoint's response schema (`AttemptResult`) bundles `score / total / percent / perProblem[] / detection[]` so the UI can render the AI-grade + detection verdict in one round-trip.

---

## 5. Server architecture

### 5.1 Layout

```
artifacts/api-server/src/
├── routes/
│   ├── course.ts          read-only course tree
│   ├── tutor.ts           SSE chat against a lecture section
│   ├── practice.ts        adaptive session lifecycle
│   ├── assignments.ts     attempt + grade + detect on submit
│   ├── analytics.ts       summary / topic mastery / activity
│   ├── detection.ts       /detection/scan passthrough
│   ├── diagnostics.ts     three diagnostics + seed maintenance
│   ├── health.ts          /healthz
│   └── index.ts           router mount
└── lib/
    ├── ai.ts              OpenAI client (Replit AI Integrations proxy)
    ├── detection.ts       GPTZero + heuristic + diachronic scoring
    ├── grading.ts         AI-graded answer with rationale
    ├── seed.ts            28-topic curriculum + auto-reseed
    └── logger.ts          singleton pino logger (req.log in routes)
```

### 5.2 Conventions

- **Validation:** every handler parses input with `safeParse` from `@workspace/api-zod` and re-`parse`s outputs before sending. Never trust the request body, never trust your own response.
- **Logging:** `req.log.info(...)` inside routes; singleton `logger` everywhere else. **Never** `console.log` in server code.
- **OpenAI:** all model calls go through `lib/ai.ts` (`chatText`, `chatJson`, `chatStream`, `FAST_MODEL`).
- **Errors:** thrown errors bubble to a global error handler that logs and returns `{ error: string }` with the right status. Detection failures are **non-fatal** — they return `null` and the caller falls back.

---

## 6. Conceptual answers and the (retained) math keyboard

The AI curriculum's answers are **plain-English conceptual statements** — define a term, draw a distinction, explain why something works, or name an example. There is no symbolic notation to compose, so the grader matches on whether the answer captures the key idea of the model answer (paraphrase-tolerant, concept-strict).

The student-facing app (`artifacts/qr-course`) still ships the floating math keyboard component (`MathKeyboard.tsx`) from the QuantReason runtime, because the engine is preserved unchanged. The AI curriculum does **not** rely on it: conceptual answers are typed as ordinary prose. The keyboard remains wired for keystroke capture, so if it is ever used, each keypress still dispatches a real `keydown` and the diachronic trace stays human-shaped.

| Sub-system | Behavior under the AI curriculum |
| --- | --- |
| Answer entry | Ordinary textarea prose; no notation required. |
| Keystroke detection | Every `keydown` counts toward the diachronic trace; plain typing reads as human. |
| Grading | Concept-matching against the stored model answer; paraphrases accepted, the essential idea required. |
| Math keyboard | Present but unused by this curriculum; left intact so the runtime is unmodified. |

---

## 7. AI detection — `artifacts/api-server/src/lib/detection.ts`

Detection runs **two independent functions** and bundles their outputs into one `DetectionOutcome`.

### 7.1 Static AI detection (GPTZero, with fallback)

Question answered: *"Was this text written by an LLM?"*

Pipeline:

1. **`gptzeroAiScore(text)`** — calls `POST https://api.gptzero.me/v2/predict/text` with `x-api-key: $GPTZERO_API_KEY`. Reads `documents[0].class_probabilities.ai` (plus half-weight of `mixed`), falls back to `completely_generated_prob`. Returns `null` on missing key, network failure, malformed response, or text shorter than 40 chars.
2. **`heuristicAiScore(text)`** — local zero-dependency scorer. Penalises long average sentence length plus presence of LLM tells (`delve`, `tapestry`, `leverag(e|ing)`, `in conclusion`, `it is important to note`, `plays a crucial/vital/pivotal role`, etc.).
3. **`llmAiScore(text)`** — secondary fallback in JSON-only mode.

Blend (`detect()`):

```
if GPTZero responded:           aiScore = 0.85 * gptzero + 0.15 * heuristic
elif LLM scorer responded:      aiScore = 0.60 * llm     + 0.40 * heuristic
else:                           aiScore = heuristic
```

`aiFlagged = aiScore >= 0.55`.

### 7.2 Diachronic detection (keystroke pattern)

Question answered: *"Did the student paste AI output and reword it to sound human?"*

`diachronicScore(text, trace)` reads a `TraceInput`:

```
{ keystrokeCount, eraseCount, bulkInsertCount?, longestBulkInsertChars?,
  rewriteSegments?, durationMs }
```

Penalty points:

| Signal | Penalty | Why |
| --- | --- | --- |
| `longestBulkInsertChars > 40` *or* `longestBulkInsertChars / textLen > 0.4` | +0.50 | One paste covers most of the answer. |
| `bulkInsertCount >= 2 && longestBulkInsert > 25` | +0.15 | Multiple paste events. |
| `keystrokeCount / textLen < 0.6` with `textLen > 30` | +0.30 | Far fewer keys than characters of output — paste-like. |
| `charsPerSecond > 12` with `textLen > 30` | +0.20 | Sustained typing speed no human maintains. |
| `longestBulkInsert > 30 && rewriteSegments >= 2` | +0.15 | Big paste followed by reword passes — the giveaway pattern. |

Clamped to `[0, 1]`. `diachronicFlagged = diachronicScore >= 0.55`.

---

## 8. Diagnostics surface

**Three diagnostics, one page.** The page lives at `artifacts/qr-course/src/pages/Diagnostics.tsx`.

### 8.1 `GET /api/diagnostics/system` — System check

Strict ordered checklist returning `{ ok, generatedAt, steps[] }`:

1. **Environment** — `DATABASE_URL` present.
2. **Database** — `SELECT 1` round-trip.
3. **Database** — course content seeded (≥28 topics, plus lectures / assignments / problems present).
4. **OpenAI** — fast-model chat completion returns non-empty text.
5. **OpenAI** — JSON mode returns `{ ok: true }`.
6. **Detection** — heuristic+scoring pipeline returns numeric `aiScore` / `diachronicScore` for a benign sentence.
7. **Grader** — `gradeAnswer` judges a paraphrased answer semantically equivalent to its model answer.

### 8.2 `POST /api/diagnostics/synthetic-run` — Synthetic student

Simulates a real student session against the live DB, end-to-end:

1. Load the course catalog and read every lecture.
2. Create an attempt for **every** assignment (all 12), answer each problem, submit, and verify `AttemptResult` returns full `perProblem[]` + `detection[]`.
3. Start an adaptive practice session, pull problems, grade, and confirm difficulty adapts.
4. Ask the AI tutor with lecture context.
5. Run an AI-detection scan on pasted-style text (expected to flag).
6. Hit analytics endpoints and confirm the new attempts are reflected.

### 8.3 `POST /api/diagnostics/content-audit` — Content auditor (OpenAI quality control)

Independent OpenAI verification of **content legitimacy**:

- Sends **every lecture body** to OpenAI as a fact-checker scoped to an introductory AI course; flags factual errors only (wrong definitions, wrong technical claims, wrong history, misused terminology), returning verbatim quotes + problem + fix.
- Sends **every stored "correct answer"** with its prompt and asks for a verdict (`correct` / `incorrect` / `ambiguous`); flags answers that are wrong, insufficient, or don't satisfy the prompt, and proposes a better answer.
- Returns a summary (lectures/problems checked, counts flagged) plus the per-item issues. This is the audit you run before shipping; it takes several minutes because every lecture and every problem is an LLM call.

### 8.4 Supporting routes (not surfaced as diagnostic cards)

- `POST /api/diagnostics/expand-lectures` — generates `body_medium` / `body_long` for lectures missing them. Idempotent.
- `POST /api/diagnostics/reset` — wipes attempts / answers / practice for a clean demo. Does **not** drop course content.

---

## 9. Student app — `@workspace/qr-course`

React + Vite + Tailwind. Routes:

| Route | Page | What it does |
| --- | --- | --- |
| `/` | `Dashboard` | Assignments progress + Course Schedule + Recent Activity |
| `/weeks/:weekNumber` | `WeekView` | List of week's lectures and assignments |
| `/lectures/:lectureId` | `LectureView` | Lecture body + Short/Medium/Long toggle + right-rail tutor / practice |
| `/practice/topic/:topicId` | `TopicPractice` | Adaptive single-topic drill |
| `/assignments` | `Assignments` | All homework / tests / midterm / final |
| `/assignments/:id` | `AssignmentRunner` | Take + review an assignment; shows AI grade + detection per answer |
| `/analytics` | `Analytics` | KPIs, topic mastery table, recent activity |
| `/diagnostics` | `Diagnostics` | Operator self-test UI (see §8) |

All server data goes through the **generated** React Query hooks from `@workspace/api-client-react`. No fetch logic should be hand-written in components.

### 9.1 Diachronic trace capture

The answer `<textarea>` is wrapped in a hook (in the assignment runner / topic practice) that:

- Counts every `keydown` (excluding modifier-only) into `keystrokeCount`.
- Increments `eraseCount` on Backspace/Delete.
- On every `input` event, compares the new value to the previous: if the diff inserted ≥4 chars in one tick, that's a "bulk insert" — increment `bulkInsertCount` and update `longestBulkInsertChars`.
- Detects a "rewrite segment" when characters are erased mid-string and replaced with new ones.
- Stamps `durationMs` = (submit time − first focus time).

The trace is included in the answer `PUT` body and on `POST submit`, then stored verbatim on `answers` so detection is reproducible.

---

## 10. Demo video — `@workspace/qr-course-demo`

A **narrated screencast-style** product walkthrough of the AI course UI, **not** a marketing reel. Built per the `video-js` skill: React + framer-motion, exported to MP4 from the preview pane via the browser recorder.

```
artifacts/qr-course-demo/src/components/video/
├── VideoTemplate.tsx        scene router + persistent sidebar + persistent cursor + background music + scene-synced narration
├── VideoWithControls.tsx    iframe-only wrapper: scene jump, scene-lock, mute toggle
├── useSceneControls.ts      hook hiding jump/lock workarounds for useVideoPlayer
├── CursorPointer.tsx        animated SVG arrow
├── TypewriterText.tsx       char-by-char typing into inputs
├── StreamingText.tsx        word-by-word AI-response streaming
├── TypingIndicator.tsx      three pulsing dots
└── video_scenes/
    ├── Scene1.tsx           Dashboard → Week 1 "What AI is and how it got here" (8s)
    ├── Scene2.tsx           Lecture 1.1 "What AI is (and isn't)": Short/Long toggle + Practice/Tutor tabs (8s)
    ├── Scene3.tsx           Tutor Q&A: "What's the difference between AI and automation?" (12s)
    ├── Scene4.tsx           Analytics with KPIs + topic mastery click (10s)
    ├── Scene5.tsx           Topic Practice: conceptual answer typed in plain English → grade → adapt (14s)
    └── Scene6.tsx           Assignments review with AI grade + AI-detection chip (10s)
```

`SCENE_DURATIONS` sums to **62 seconds**, looped.

### 10.1 Audio

Two layers, both wired in `VideoTemplate.tsx`:

- **Background music** — `public/audio/bg_music.mp3`, played at low volume (0.16) and scene-synced via `SCENE_START_SEC`.
- **Narration voiceover** — one clip per scene (`public/audio/narration_s1.mp3` … `narration_s6.mp3`), generated via the `media-generation` text-to-speech tool. On every scene change the narration `<audio>` swaps its `src` to the active scene's clip and restarts from `0`, which keeps the voiceover aligned through linear playback, scene jumps, and loops. Each clip is authored to fit within its scene's duration. The mute toggle mutes both audio elements declaratively.

### 10.2 Key architectural rules

- **Sidebar persistence.** Sidebar lives in `VideoTemplate.tsx` outside `<AnimatePresence>`. Only the right-pane scene swaps.
- **Cursor persistence.** `CursorPointer` lives outside `<AnimatePresence>` and is driven by `setCursorPos / setIsClicking` passed into every scene.
- **The UI is rebuilt, not screenshotted.** Scenes use the real fonts and colours but every pixel is JSX.
- **`AnimatePresence` key = `currentSceneKey`** (NOT `baseSceneKey`). When scene-lock toggles `_r1` / `_r2`, both iterations must remount.
- **Mute wiring.** The mute toggle is declarative JSX (`<audio muted={muted}>`) only — background-music re-seek must not run on mute toggle, or unmute restarts the scene's audio. Narration restarts per scene by design.

---

## 11. README contract

`replit.md` and `README.md` are the always-loaded project READMEs. They contain:

1. **Product overview** — what the course is and why this build exists (the conceptual ideas behind AI).
2. **Required env / secrets** — `DATABASE_URL`, `OPENAI_API_KEY`, `GPTZERO_API_KEY`, `SESSION_SECRET`.
3. **Curriculum summary** — the 28 concepts across four weeks.
4. **Technical features** — conceptual-answer grading, two-layer detection, three diagnostics, auto-reseed, contract-first API.

If you change anything in this blueprint, update `README.md` and `replit.md` to match — they are the long-form and short-form views of the same truth.

---

## 12. End-to-end request example

A student submits Homework 1.1 (what AI is, history, and the two paradigms). The full path:

1. Browser: `qr-course/src/pages/AssignmentRunner.tsx` calls the generated `useSubmitAttempt()` hook with `{ traces: { [problemId]: TraceInput } }`. The conceptual answer is typed as ordinary prose, and every `keydown` was counted so the trace looks human.
2. Generated client: `POST /api/assignments/{id}/attempts/{aid}/submit`, validated against `SubmitAttemptBody` Zod schema.
3. Express route (`routes/assignments.ts`):
   - Loads `attempt` + `answers` + `problems` from Drizzle.
   - For each answer: calls `gradeAnswer(problem, answer)` (OpenAI JSON mode, returns `{ correct, rationale }`) **and** `detect(answer.text, trace)` in parallel.
   - Writes `correct`, `aiScore`, `aiFlagged`, `diachronicScore`, `diachronicFlagged`, `detectionRationale` back onto each answer row.
   - Updates `attempts.status = "submitted"`, computes `scorePercent`.
4. Returns `AttemptResult` validated against the generated Zod schema.
5. Browser: `AssignmentRunner` renders per-problem cards with the AI grade rationale + a detection chip (`Human-written response · confidence 94%` or `AI-detected · 91%`).

Every layer in that chain (spec → server zod → server logic → client hook → client zod) is generated or validated from the same `openapi.yaml`. Don't introduce a parallel path.
