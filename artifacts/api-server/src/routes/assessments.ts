import { Router, type IRouter } from "express";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import {
  db,
  topicsTable,
  diagnosticAttemptsTable,
  diagnosticQuestionsTable,
  diagnosticResponsesTable,
} from "@workspace/db";
import {
  GetDiagnosticOverviewResponse,
  StartDiagnosticBody,
  StartCustomDiagnosticBody,
  GetDiagnosticAttemptResponse,
  SaveDiagnosticAnswerBody,
  SubmitDiagnosticResponse,
  GetDiagnosticPerformanceResponse,
} from "@workspace/api-zod";
import {
  SLOTS,
  FORMATS,
  FORMAT_ORDER,
  CREDIT_MAX,
  questionCount,
  slotByKey,
  type DiagnosticFormat,
} from "../lib/diagnostics-config";
import {
  generateForSlot,
  generateCustom,
  topicsForWeeks,
  type GeneratedQuestion,
} from "../lib/diagnostics-gen";
import { gradeAnswer } from "../lib/grading";

const router: IRouter = Router();

function parseIdParam(raw: unknown): number {
  const s = Array.isArray(raw) ? raw[0] : (raw as string);
  return parseInt(s ?? "", 10);
}

const FIXED_SLOT_KEYS = new Set(SLOTS.map((s) => s.key));

async function countSubmittedOfficialSlots(): Promise<number> {
  const rows = await db
    .select({ slotKey: diagnosticAttemptsTable.slotKey })
    .from(diagnosticAttemptsTable)
    .where(
      and(
        eq(diagnosticAttemptsTable.isOfficial, true),
        eq(diagnosticAttemptsTable.isCustom, false),
        eq(diagnosticAttemptsTable.status, "submitted"),
      ),
    );
  const slots = new Set<string>();
  for (const r of rows) if (FIXED_SLOT_KEYS.has(r.slotKey as never)) slots.add(r.slotKey);
  return slots.size;
}

function creditFor(officialCompleted: number): number {
  return Number(((officialCompleted / SLOTS.length) * CREDIT_MAX).toFixed(2));
}

// ─────────────────────────────────────────────────────────────────────────
// Overview
// ─────────────────────────────────────────────────────────────────────────
router.get("/assessments/overview", async (_req, res) => {
  const attempts = await db
    .select()
    .from(diagnosticAttemptsTable)
    .where(eq(diagnosticAttemptsTable.isCustom, false))
    .orderBy(asc(diagnosticAttemptsTable.id));

  const slots = SLOTS.map((slot) => {
    const formats = FORMAT_ORDER.map((fmt) => {
      const fa = attempts.filter((a) => a.slotKey === slot.key && a.format === fmt);
      const submitted = fa.filter((a) => a.status === "submitted");
      const best = submitted.reduce(
        (b, a) => (a.scorePercent != null && a.scorePercent > b ? a.scorePercent : b),
        -1,
      );
      const last = fa[fa.length - 1];
      return {
        format: fmt,
        label: FORMATS[fmt].label,
        required: FORMATS[fmt].required,
        questionCount: questionCount(fmt),
        attemptsCount: submitted.length,
        bestScore: best < 0 ? null : Number(best.toFixed(2)),
        lastAttemptId: last?.id ?? null,
        lastPercent:
          last?.scorePercent != null ? Number(last.scorePercent.toFixed(2)) : null,
        completed: submitted.length > 0,
      };
    });
    return {
      key: slot.key,
      title: slot.title,
      when: slot.when,
      aptitude: slot.aptitude,
      weeks: slot.weeks,
      formats,
    };
  });

  const officialCompleted = await countSubmittedOfficialSlots();
  res.json(
    GetDiagnosticOverviewResponse.parse({
      slots,
      officialRequired: SLOTS.length,
      officialCompleted,
      creditPercent: creditFor(officialCompleted),
      creditMax: CREDIT_MAX,
    }),
  );
});

// ─────────────────────────────────────────────────────────────────────────
// Helpers to persist a generated assessment and return its take-view state
// ─────────────────────────────────────────────────────────────────────────
async function persistAttempt(opts: {
  slotKey: string;
  format: DiagnosticFormat;
  title: string;
  isOfficial: boolean;
  isCustom: boolean;
  scopeDescription: string | null;
  weeksCovered: number[];
  questions: GeneratedQuestion[];
}) {
  const [attempt] = await db
    .insert(diagnosticAttemptsTable)
    .values({
      slotKey: opts.slotKey,
      format: opts.format,
      title: opts.title,
      isOfficial: opts.isOfficial,
      isCustom: opts.isCustom,
      scopeDescription: opts.scopeDescription,
      weeksCovered: opts.weeksCovered,
      status: "in_progress",
    })
    .returning();
  if (!attempt) throw new Error("Failed to create diagnostic attempt");

  for (let i = 0; i < opts.questions.length; i++) {
    const q = opts.questions[i]!;
    await db.insert(diagnosticQuestionsTable).values({
      attemptId: attempt.id,
      position: i,
      type: q.type,
      prompt: q.prompt,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      topicId: q.topicId,
      weekNumber: q.weekNumber,
    });
  }
  return attempt.id;
}

async function loadAttemptState(attemptId: number) {
  const [attempt] = await db
    .select()
    .from(diagnosticAttemptsTable)
    .where(eq(diagnosticAttemptsTable.id, attemptId));
  if (!attempt) return null;
  const questions = await db
    .select()
    .from(diagnosticQuestionsTable)
    .where(eq(diagnosticQuestionsTable.attemptId, attemptId))
    .orderBy(asc(diagnosticQuestionsTable.position));
  const responses = await db
    .select()
    .from(diagnosticResponsesTable)
    .where(eq(diagnosticResponsesTable.attemptId, attemptId));
  return {
    id: attempt.id,
    slotKey: attempt.slotKey,
    title: attempt.title,
    format: attempt.format as DiagnosticFormat,
    isOfficial: attempt.isOfficial,
    isCustom: attempt.isCustom,
    scopeDescription: attempt.scopeDescription,
    weeksCovered: (attempt.weeksCovered as number[]) ?? [],
    status: attempt.status as "in_progress" | "submitted",
    questions: questions.map((q) => ({
      id: q.id,
      position: q.position,
      type: q.type as "mc" | "written",
      prompt: q.prompt,
      options: (q.options as string[] | null) ?? null,
    })),
    responses: responses.map((r) => ({ questionId: r.questionId, answer: r.answer })),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Start a fixed-slot assessment
// ─────────────────────────────────────────────────────────────────────────
router.post("/assessments/start", async (req, res): Promise<void> => {
  const parsed = StartDiagnosticBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { slotKey, format } = parsed.data;
  const slot = slotByKey(slotKey);
  if (!slot) {
    res.status(400).json({ error: "unknown slot" });
    return;
  }
  const fmt = format as DiagnosticFormat;
  if (!FORMATS[fmt]) {
    res.status(400).json({ error: "unknown format" });
    return;
  }

  let questions: GeneratedQuestion[];
  try {
    questions = await generateForSlot(slot, fmt);
  } catch (err) {
    req.log.error({ err }, "diagnostic generation failed");
    res.status(502).json({ error: "Failed to generate the assessment. Please try again." });
    return;
  }

  const attemptId = await persistAttempt({
    slotKey: slot.key,
    format: fmt,
    title: `${slot.title} — ${FORMATS[fmt].label}`,
    isOfficial: fmt === "official",
    isCustom: false,
    scopeDescription: null,
    weeksCovered: slot.weeks,
    questions,
  });
  const state = await loadAttemptState(attemptId);
  res.json(GetDiagnosticAttemptResponse.parse(state));
});

// ─────────────────────────────────────────────────────────────────────────
// Build a custom assessment scoped to the learner's needs
// ─────────────────────────────────────────────────────────────────────────
async function masteryByTopic(): Promise<Map<number, { attempts: number; accuracy: number }>> {
  const out = new Map<number, { attempts: number; accuracy: number }>();
  const merge = (rows: Array<{ topic_id: number; n: number; acc: number }>) => {
    for (const r of rows) {
      const id = Number(r.topic_id);
      const n = Number(r.n);
      const acc = Number(r.acc);
      const prev = out.get(id);
      if (!prev) {
        out.set(id, { attempts: n, accuracy: acc });
      } else {
        const total = prev.attempts + n;
        const blended = total === 0 ? 0 : (prev.accuracy * prev.attempts + acc * n) / total;
        out.set(id, { attempts: total, accuracy: blended });
      }
    }
  };
  const practice = await db.execute(sql`
    select topic_id, count(*)::int as n, avg(case when correct then 1.0 else 0.0 end) as acc
    from practice_attempts group by topic_id
  `);
  merge(practice.rows as Array<{ topic_id: number; n: number; acc: number }>);
  const diag = await db.execute(sql`
    select q.topic_id as topic_id, count(*)::int as n,
           avg(case when r.correct then 1.0 else 0.0 end) as acc
    from diagnostic_responses r
    join diagnostic_questions q on r.question_id = q.id
    where q.topic_id is not null and r.correct is not null
    group by q.topic_id
  `);
  merge(diag.rows as Array<{ topic_id: number; n: number; acc: number }>);
  return out;
}

router.post("/assessments/custom", async (req, res): Promise<void> => {
  const parsed = StartCustomDiagnosticBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const scopeText = parsed.data.scopeText.trim();
  if (!scopeText) {
    res.status(400).json({ error: "scope is required" });
    return;
  }

  // Heuristically narrow to requested weeks, else use all topics.
  const wantedWeeks: number[] = [];
  for (const m of scopeText.matchAll(/week\s*(\d)/gi)) {
    const w = parseInt(m[1] ?? "", 10);
    if (w >= 1 && w <= 4 && !wantedWeeks.includes(w)) wantedWeeks.push(w);
  }
  const topics =
    wantedWeeks.length > 0
      ? await topicsForWeeks(wantedWeeks)
      : await db
          .select({
            id: topicsTable.id,
            title: topicsTable.title,
            weekNumber: topicsTable.weekNumber,
            blurb: topicsTable.blurb,
          })
          .from(topicsTable);

  if (topics.length === 0) {
    res.status(400).json({ error: "No topics match that scope." });
    return;
  }

  const mastery = await masteryByTopic();
  let questions: GeneratedQuestion[];
  try {
    questions = await generateCustom({ scopeText, topics, mastery, mc: 3, written: 3 });
  } catch (err) {
    req.log.error({ err }, "custom diagnostic generation failed");
    res.status(502).json({ error: "Failed to build the assessment. Please try again." });
    return;
  }

  const coveredWeeks = Array.from(new Set(questions.map((q) => q.weekNumber).filter((w): w is number => w != null))).sort();
  const attemptId = await persistAttempt({
    slotKey: "custom",
    format: "hybrid",
    title: `Custom Assessment`,
    isOfficial: false,
    isCustom: true,
    scopeDescription: scopeText,
    weeksCovered: coveredWeeks.length > 0 ? coveredWeeks : wantedWeeks,
    questions,
  });
  const state = await loadAttemptState(attemptId);
  res.json(GetDiagnosticAttemptResponse.parse(state));
});

// ─────────────────────────────────────────────────────────────────────────
// Get attempt
// ─────────────────────────────────────────────────────────────────────────
router.get("/assessments/attempts/:attemptId", async (req, res): Promise<void> => {
  const id = parseIdParam(req.params.attemptId);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const state = await loadAttemptState(id);
  if (!state) {
    res.status(404).json({ error: "attempt not found" });
    return;
  }
  res.json(GetDiagnosticAttemptResponse.parse(state));
});

// ─────────────────────────────────────────────────────────────────────────
// Save a response
// ─────────────────────────────────────────────────────────────────────────
router.put("/assessments/attempts/:attemptId/answer", async (req, res): Promise<void> => {
  const id = parseIdParam(req.params.attemptId);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const parsed = SaveDiagnosticAnswerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { questionId, answer, trace } = parsed.data;

  const [attempt] = await db
    .select()
    .from(diagnosticAttemptsTable)
    .where(eq(diagnosticAttemptsTable.id, id));
  if (!attempt) {
    res.status(404).json({ error: "attempt not found" });
    return;
  }
  if (attempt.status !== "in_progress") {
    res.status(400).json({ error: "attempt already submitted" });
    return;
  }

  const [question] = await db
    .select()
    .from(diagnosticQuestionsTable)
    .where(
      and(
        eq(diagnosticQuestionsTable.id, questionId),
        eq(diagnosticQuestionsTable.attemptId, id),
      ),
    );
  if (!question) {
    res.status(404).json({ error: "question not in this attempt" });
    return;
  }

  const [existing] = await db
    .select()
    .from(diagnosticResponsesTable)
    .where(
      and(
        eq(diagnosticResponsesTable.attemptId, id),
        eq(diagnosticResponsesTable.questionId, questionId),
      ),
    );
  const values = {
    attemptId: id,
    questionId,
    answer,
    keystrokeCount: trace?.keystrokeCount ?? 0,
    eraseCount: trace?.eraseCount ?? 0,
    durationMs: trace?.durationMs ?? 0,
    updatedAt: new Date(),
  };
  if (existing) {
    await db
      .update(diagnosticResponsesTable)
      .set(values)
      .where(eq(diagnosticResponsesTable.id, existing.id));
  } else {
    await db.insert(diagnosticResponsesTable).values(values);
  }
  res.json({ ok: true });
});

// ─────────────────────────────────────────────────────────────────────────
// Submit (completion credit; correctness recorded for the profile)
// ─────────────────────────────────────────────────────────────────────────
router.post("/assessments/attempts/:attemptId/submit", async (req, res): Promise<void> => {
  const id = parseIdParam(req.params.attemptId);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const [attempt] = await db
    .select()
    .from(diagnosticAttemptsTable)
    .where(eq(diagnosticAttemptsTable.id, id));
  if (!attempt) {
    res.status(404).json({ error: "attempt not found" });
    return;
  }
  const questions = await db
    .select()
    .from(diagnosticQuestionsTable)
    .where(eq(diagnosticQuestionsTable.attemptId, id))
    .orderBy(asc(diagnosticQuestionsTable.position));
  const responses = await db
    .select()
    .from(diagnosticResponsesTable)
    .where(eq(diagnosticResponsesTable.attemptId, id));
  const byQuestion = new Map(responses.map((r) => [r.questionId, r]));

  // Completion = credit. An assessment can only be submitted (and thus count
  // toward the 20% completion credit) once every question has a non-empty
  // answer; this prevents earning credit by submitting blank officials.
  const unanswered = questions.filter(
    (q) => (byQuestion.get(q.id)?.answer ?? "").trim().length === 0,
  ).length;
  if (questions.length === 0 || unanswered > 0) {
    res.status(400).json({
      error: "incomplete",
      message: `Answer all questions before submitting (${unanswered} unanswered).`,
      unanswered,
    });
    return;
  }

  const perQuestion = [];
  let score = 0;
  for (const q of questions) {
    const r = byQuestion.get(q.id);
    const userAnswer = r?.answer ?? "";
    let correct = false;
    if (q.type === "mc") {
      correct = userAnswer.trim() === q.correctAnswer.trim();
    } else if (userAnswer.trim().length > 0) {
      const graded = await gradeAnswer({
        prompt: q.prompt,
        correctAnswer: q.correctAnswer,
        userAnswer,
      });
      correct = graded.correct;
    }
    if (correct) score += 1;
    if (r) {
      await db
        .update(diagnosticResponsesTable)
        .set({ correct })
        .where(eq(diagnosticResponsesTable.id, r.id));
    }
    perQuestion.push({
      questionId: q.id,
      position: q.position,
      type: q.type as "mc" | "written",
      prompt: q.prompt,
      options: (q.options as string[] | null) ?? null,
      yourAnswer: userAnswer,
      correctAnswer: q.correctAnswer,
      correct,
      explanation: q.explanation,
    });
  }

  const total = questions.length;
  const percent = total === 0 ? 0 : Number(((score / total) * 100).toFixed(2));
  await db
    .update(diagnosticAttemptsTable)
    .set({ status: "submitted", submittedAt: new Date(), scorePercent: percent })
    .where(eq(diagnosticAttemptsTable.id, id));

  const officialCompleted = await countSubmittedOfficialSlots();
  res.json(
    SubmitDiagnosticResponse.parse({
      attemptId: id,
      slotKey: attempt.slotKey,
      title: attempt.title,
      format: attempt.format as DiagnosticFormat,
      score,
      total,
      percent,
      completed: true,
      creditPercent: creditFor(officialCompleted),
      perQuestion,
    }),
  );
});

// ─────────────────────────────────────────────────────────────────────────
// Performance profile
// ─────────────────────────────────────────────────────────────────────────
router.get("/assessments/performance", async (_req, res) => {
  const submitted = await db
    .select()
    .from(diagnosticAttemptsTable)
    .where(eq(diagnosticAttemptsTable.status, "submitted"))
    .orderBy(desc(diagnosticAttemptsTable.id));

  // Per-week accuracy from diagnostic responses.
  const weekRows = await db.execute(sql`
    select q.week_number as week, count(*)::int as n,
           avg(case when r.correct then 1.0 else 0.0 end) as acc
    from diagnostic_responses r
    join diagnostic_questions q on r.question_id = q.id
    where q.week_number is not null and r.correct is not null
    group by q.week_number order by q.week_number
  `);
  const perWeek = (weekRows.rows as Array<{ week: number; n: number; acc: number }>).map(
    (r) => ({
      weekNumber: Number(r.week),
      attempts: Number(r.n),
      accuracy: Number(Number(r.acc).toFixed(3)),
    }),
  );

  const perSlot = SLOTS.map((slot) => {
    const sa = submitted.filter((a) => a.slotKey === slot.key);
    const official = sa.filter((a) => a.isOfficial);
    const best = sa.reduce(
      (b, a) => (a.scorePercent != null && a.scorePercent > b ? a.scorePercent : b),
      -1,
    );
    return {
      slotKey: slot.key,
      title: slot.title,
      attempts: sa.length,
      bestScore: best < 0 ? null : Number(best.toFixed(2)),
      completed: official.length > 0,
    };
  });

  const recent = submitted.slice(0, 15).map((a) => ({
    attemptId: a.id,
    label: a.title,
    format: a.format,
    percent: a.scorePercent != null ? Number(a.scorePercent.toFixed(2)) : 0,
    at: (a.submittedAt ?? a.startedAt).toISOString(),
  }));

  const officialCompleted = await countSubmittedOfficialSlots();
  res.json(
    GetDiagnosticPerformanceResponse.parse({
      officialCompleted,
      officialRequired: SLOTS.length,
      creditPercent: creditFor(officialCompleted),
      creditMax: CREDIT_MAX,
      perWeek,
      perSlot,
      recent,
    }),
  );
});

export default router;
