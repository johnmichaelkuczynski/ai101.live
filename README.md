# 🤖 Teach Yourself AI

**A Four-Week Introductory Course on the Ideas Behind Artificial Intelligence — From "What Is AI?" to Agents, Alignment, and the Future**

---

## 🧩 Overview

Teach Yourself AI is a self-paced, single-user web course that asks the question AI coverage usually skips: *what are these systems, really?* What is a model? What does "training" actually mean? How does a neural network learn? Why do language models make things up? What is bias, alignment, or an AI agent? The course answers these conceptually — in plain English, with no math or coding background required — one connected idea at a time.

It is a content reskin of the **QuantReason** Quantitative Reasoning app. The full QuantReason runtime — lectures with Short / Medium / Long depth, section-scoped AI tutor, adaptive practice, AI-graded homework / tests / midterm / final, two-layer AI-authorship detection, and one-click diagnostics — is preserved unchanged. The **purpose** of this build is to teach the conceptual backbone of modern AI: how machines learn from data, what neural networks and generative models do, and how to use AI responsibly.

---

## 🧠 What It Does

- **Four-Week Curriculum of 28 Micro-Lectures** — Organized by theme:
  - **Week 1 — What AI is and how it got here.** What AI is and isn't (automation vs. intelligence); a brief history from symbolic AI to machine learning; rules vs. learning; data as the raw material; what "training" actually means; models as input-output functions; and where AI shows up in everyday life.
  - **Week 2 — How machines learn.** Pattern recognition; features and representations; supervised learning from labels; unsupervised learning (finding structure); prediction, classification, and error (precision and recall); and why more data and bigger models help.
  - **Week 3 — Neural networks and generative AI.** The intuition behind neural networks; how networks learn (loss, backpropagation, gradient descent); from neural nets to deep learning; language models and next-token prediction; what "generative" AI means; prompting; and the strengths, limits, and hallucination of these systems.
  - **Week 4 — AI in the world: ethics, safety, and the future.** Bias, fairness, and data quality; reliability, evaluation, and trust; privacy and security; automation, work, and the economy; alignment and AI safety basics; a practical workflow for using AI well; the near future of agents; and a capstone synthesis.
- **One Real Example per Lecture** — Every micro-lecture grounds its concept in a concrete, real-world example — e.g. Deep Blue vs. AlphaGo as symbolic-vs-learned AI, the ImageNet dataset launching deep learning, a recruiting tool that learned historical bias, the boat-racing AI that gamed its reward by spinning in circles, language models regurgitating memorized training data, and coding agents that act over multiple steps.
- **One Conceptual Question per Lecture** — Every homework / test / midterm / final problem is a short-answer conceptual question (define a term, draw a distinction, explain why something works, identify an example) answered in plain English — no math or code required.
- **Three-Depth Lectures, Section-Scoped Tutor, Adaptive Practice, AI Grading, Two-Layer Detection, Operator Diagnostics** — All inherited unchanged from the QuantReason runtime.
- **12 Graded Assignments** — Two homeworks per week plus a graded weekly checkpoint: Week 1 test, end-of-Week-2 midterm, Week 3 test, end-of-Week-4 cumulative final.
- **Built-In Product Demo Video** — The companion `qr-course-demo` artifact ships as a short, narrated screencast of the live UI.

---

## ⚙️ Technical Features

- **Conceptual Answer Grading** — Every problem's canonical answer is a short conceptual statement. The AI grader (with a numeric short-circuit retained for harmless edge cases) judges whether the student's answer captures the key idea of the model answer, accepting paraphrases and lenient wording while staying strict on the essential concept.
- **Static AI Detection (GPTZero):** Every submitted answer is sent to GPTZero's `predict/text` endpoint; the per-document AI probability is blended `0.85 × GPTZero + 0.15 × structural-heuristic` for the final score. If GPTZero is unavailable, the system silently falls back to an LLM scorer plus heuristic — submissions never block.
- **Diachronic Keystroke Detection:** The student textarea captures keystroke count, erase count, bulk-insert events, longest bulk insert, rewrite segments, and total duration. A scorer penalizes paste-then-reword behavior, low keystroke-to-output ratios, and impossibly sustained typing speeds.
- **System Diagnostic (`/diagnostics/system`):** environment, database round-trip, course-seed integrity, OpenAI chat completion, OpenAI JSON mode, detection pipeline, and grader equivalence check. Each step returns pass/fail, timing, and a raw error string.
- **Synthetic-Student Diagnostic (`/diagnostics/synthetic-run`):** end-to-end stack proof — a synthetic student reads every lecture, takes and submits every assignment, runs adaptive practice, asks the tutor, and triggers detection, verifying grading + detection + analytics all reflect the run.
- **Content Auditor (`/diagnostics/content-audit`):** sends every lecture body and every stored "correct answer" to OpenAI for an independent verdict on whether each is actually correct — flagging wrong definitions, inaccurate claims about how AI works, misused terminology, and conceptual answers that don't satisfy their prompt.
- **Auto-Reseed on Curriculum Change** — `seedIfEmpty` compares the set of topic slugs in the database to the expected curriculum *and* checks a sentinel phrase in a designated lecture. If either differs, it wipes and re-seeds in dependency order. A single content swap propagates cleanly on the next server start.
- **Contract-First API** — Single OpenAPI document; React Query hooks for the UI and Zod validators for the server are generated from it.
- **Streaming AI Tutor** — Token-by-token Server-Sent-Event streaming with a section-scoped system prompt grounded in the active lecture.
- **Adaptive Practice Engine** — Per-session difficulty (1–5) adjusts after each attempt; conceptual questions are generated on demand.

---

## 🔐 Required Secrets

- `DATABASE_URL` — Postgres connection string for the external database.
- `OPENAI_API_KEY` — required at boot. Powers the tutor, practice generator, AI graders, content auditor, and lecture-expansion job.
- `GPTZERO_API_KEY` — required for the GPTZero leg of the static-AI-detection layer. If absent, the system falls back to the LLM scorer + heuristic but loses the primary detection signal.
- `SESSION_SECRET` — signed-session cookie secret.

---

## 🎓 Designed For

- **Anyone Curious About AI Who Wants the Concepts, Not the Hype:** A short, focused course on the conceptual scaffolding behind modern AI — data, learning, models, neural networks, generation, and responsible use — with no math or coding prerequisites.
- **The Maintainer of QuantReason and Its Clones:** A stress test of the runtime — tutor, grading, detection, adaptive practice, and diagnostics — under a different, prose-based curriculum whose answers are conceptual rather than symbolic.

---

## 💡 Core Idea

Most coverage of AI is either breathless hype or dense technical detail. This course takes the middle path: it explains the real ideas behind AI clearly enough that anyone can follow, and honestly enough that you come away able to tell what these systems can and cannot do.

Read the idea, see it grounded in a real example, then explain the idea in your own words.

**Teach Yourself AI — read the idea, ground the idea, explain the idea.**
