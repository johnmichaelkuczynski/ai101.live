# 🧠 AI Logic — by Zhi Systems

**A Four-Unit Course on How Artificial Intelligence Actually Reasons — From Inference and Entailment to Notation, Meta-Logic, and Models**

---

## 🧩 Overview

AI Logic is a self-paced, single-user web course that explains how modern AI systems reason — and why that reasoning departs from classical logic. What is inference when there are no explicit rules? How does logical *entailment* become *pattern activation*? Why is AI ampliative — generating more than its inputs strictly contain — and therefore fallible by nature? What does it mean for a neural network to "know" something, or to be a "model"? The course answers these conceptually, one connected idea at a time, in plain English with no math or coding background required.

The course is a content reskin of the **QuantReason** Quantitative Reasoning app. The full QuantReason runtime — lectures with short / medium / long depth, section-scoped AI tutor, adaptive practice, AI-graded homework / tests / midterm / final, two-layer AI-authorship detection, and one-click diagnostics — is preserved unchanged. The **purpose** of this build is to teach the conceptual backbone of AI logic: how reasoning is reconceived once it runs on learned associations rather than explicit propositions.

---

## 🧠 What It Does

- **Four-Unit Curriculum of 32 Micro-Lectures** — Organized by theme:
  - **Unit 1 — Fundamental Concepts** (8 lectures): the concept of inference (forming a new belief on the basis of an old one); types of inference (deductive, inductive, abductive); entailment vs. pattern activation; the over-valuation of entailment; confirmation vs. confidence scores; the ampliative thesis; knowledge in an AI system; and AI and anti-skepticism.
  - **Unit 2 — Notational Conventions** (8 lectures): why AI logic needs its own notation; representing defeasible inference; encoding non-monotonic reasoning; semantic networks and embedding space; marking confidence and strength; the syntax/semantics collapse; transformative vs. ampliative steps; and the limits of formalization.
  - **Unit 3 — Meta-Logical Principles** (8 lectures): what a meta-logical principle is; soundness and completeness reconceived; defeasibility as a governing principle; consistency under revision; pattern recognition as a primitive; screening, defeat, and override; why classical logic is transformative; and the meta-logic of learning.
  - **Unit 4 — Models** (8 lectures): what a model is in AI logic; neural networks as models; embedding spaces as models; how a model binds to data; parsimony; testing and revising a model; and the hybrid frontier of symbolic and learned reasoning.
- **One Real Example per Lecture** — Every micro-lecture grounds its concept in a concrete example — e.g. a fraud-detection model "inferring" by pattern activation rather than explicit reasoning, a language model treating a genuine entailment as just another learned association, and the way adding one fact can retract a previously sound conclusion (non-monotonicity).
- **One Conceptual Question per Lecture** — Every homework / test / midterm / final problem is a short-answer conceptual question (define a term, draw a distinction, explain why something works, identify an example) answered in plain English — no math or code required.
- **Three-Depth Lectures, Section-Scoped Tutor, Adaptive Practice, AI Grading, Two-Layer Detection, One-Click Diagnostics** — All inherited unchanged from the QuantReason runtime.
- **Built-In Product Demo Video (with background music)** — The companion `qr-course-demo` artifact ships as a short screencast of the live UI, scored with a background music bed.

---

## ⚙️ Technical Features

- **Conceptual Answer Grading** — Every problem's canonical answer is a short conceptual statement. The AI grader (with a numeric short-circuit retained for harmless edge cases) judges whether the student's answer captures the key idea of the model answer, accepting paraphrases and lenient wording while staying strict on the essential concept.
- **Two-Layer AI-Authorship Detection** —
  - **Static (GPTZero):** Every submitted answer is sent to GPTZero's `predict/text` endpoint; the per-document AI probability is blended `0.85 × GPTZero + 0.15 × structural-heuristic` for the final score. If GPTZero is unavailable, the system silently falls back to an LLM scorer plus heuristic.
  - **Diachronic (Keystroke Pattern):** The student textarea captures keystroke count, erase count, bulk-insert events, longest bulk insert, rewrite segments, and total duration. A scorer penalizes paste-then-reword behavior, low keystroke-to-output ratios, and impossibly sustained typing speeds.
- **Three Diagnostic Self-Tests** —
  - **System Diagnostic** (`/diagnostics/system`): environment, database round-trip, course-seed integrity, OpenAI chat completion, OpenAI JSON mode, detection pipeline, and grader equivalence check.
  - **Synthetic-Student Diagnostic** (`/diagnostics/synthetic-run`): end-to-end stack proof — a synthetic student reads every lecture, takes and submits every assignment, runs adaptive practice, asks the tutor, and triggers detection, verifying grading + detection + analytics all reflect the run.
  - **Content Auditor** (`/diagnostics/content-audit`): sends every lecture body and every stored "correct answer" to OpenAI for an independent verdict on whether each is actually correct, flagging wrong definitions, inaccurate claims about how AI reasons, misused terminology, and conceptual answers that don't satisfy their prompt.
- **Auto-Reseed on Curriculum Change** — `seedIfEmpty` compares the set of topic slugs in the database to the expected curriculum *and* checks a sentinel phrase in a designated lecture. If either differs, it wipes and re-seeds in dependency order. This is what lets a single content swap propagate cleanly when the seed file changes.
- **Contract-First API** — Single OpenAPI document; React Query hooks for the UI and Zod validators for the server are generated from it.
- **Streaming AI Tutor** — Token-by-token Server-Sent-Event streaming with a section-scoped system prompt grounded in the active lecture.
- **Adaptive Practice Engine** — Per-session difficulty (1–5) adjusts after each attempt; conceptual questions are generated on demand.
- **Operator Console** — Dedicated Diagnostics page surfaces all three self-tests with one-click execution and raw error output.

> Note: the on-screen math keyboard component remains in the codebase (the engine is preserved unchanged), but the AI Logic curriculum's answers are plain-English conceptual statements, so the course does not rely on it. The runtime reuses the four "week" slots as the four AI Logic **units**.

---

## 🔐 Required Secrets

- `OPENAI_API_KEY` — required at boot. Powers the tutor, practice generator, AI graders, and lecture-expansion job.
- `GPTZERO_API_KEY` — required for the GPTZero leg of the static-AI-detection layer. If absent, the system falls back to the LLM scorer + heuristic, but you lose the primary detection signal.

Both are requested via the secrets panel; neither is hard-coded.

---

## 🎓 Designed For

- **Anyone Who Wants to Understand How AI Reasons:** A short, focused course on the conceptual scaffolding behind AI logic — inference, entailment, defeasibility, meta-logic, and models — with no math or coding prerequisites.
- **The Maintainer of QuantReason and Its Clones:** A stress test of the runtime — tutor, grading, detection, adaptive practice, and diagnostics — under a different, prose-based curriculum whose answers are conceptual rather than symbolic.

---

## 💡 Core Idea

Classical logic was built for explicit propositions and necessary entailment. AI systems reason differently: they activate learned patterns, generate more than their inputs contain, and revise conclusions when new evidence arrives. AI Logic takes those differences seriously and explains them clearly enough that anyone can follow — and honestly enough that you come away able to tell what these systems' "reasoning" really is.

Read the idea, see it grounded in a real example, then explain the idea in your own words.

**AI Logic by Zhi Systems — read the idea, ground the idea, explain the idea.**

---

## User preferences

_(none recorded yet)_
