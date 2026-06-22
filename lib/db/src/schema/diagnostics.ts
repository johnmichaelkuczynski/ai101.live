import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  jsonb,
  doublePrecision,
} from "drizzle-orm/pg-core";

// A single sitting of a diagnostic assessment. Diagnostics are NOT graded for
// correctness — completing one earns full credit — but we still record the
// score for the student's performance profile.
export const diagnosticAttemptsTable = pgTable("diagnostic_attempts", {
  id: serial("id").primaryKey(),
  // One of the seven fixed slots ("pre","w1","w2","w1_2","w3","w4","w1_4") or
  // "custom" for a learner-built assessment.
  slotKey: text("slot_key").notNull(),
  // mc | written | hybrid | official
  format: text("format").notNull(),
  title: text("title").notNull(),
  isOfficial: boolean("is_official").notNull().default(false),
  isCustom: boolean("is_custom").notNull().default(false),
  // For custom assessments: the learner's scope request, e.g. "only Week 2".
  scopeDescription: text("scope_description"),
  // Weeks this assessment draws from (empty for the pre-course aptitude check).
  weeksCovered: jsonb("weeks_covered").notNull().default([]),
  status: text("status").notNull().default("in_progress"), // in_progress | submitted
  scorePercent: doublePrecision("score_percent"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
});

export const diagnosticQuestionsTable = pgTable("diagnostic_questions", {
  id: serial("id").primaryKey(),
  attemptId: integer("attempt_id")
    .notNull()
    .references(() => diagnosticAttemptsTable.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  type: text("type").notNull(), // mc | written
  prompt: text("prompt").notNull(),
  // For multiple-choice: the answer options. Null for written questions.
  options: jsonb("options"),
  // For MC: the exact text of the correct option. For written: the model answer.
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  topicId: integer("topic_id"),
  weekNumber: integer("week_number"),
});

export const diagnosticResponsesTable = pgTable("diagnostic_responses", {
  id: serial("id").primaryKey(),
  attemptId: integer("attempt_id")
    .notNull()
    .references(() => diagnosticAttemptsTable.id, { onDelete: "cascade" }),
  questionId: integer("question_id")
    .notNull()
    .references(() => diagnosticQuestionsTable.id, { onDelete: "cascade" }),
  answer: text("answer").notNull().default(""),
  correct: boolean("correct"),
  keystrokeCount: integer("keystroke_count").notNull().default(0),
  eraseCount: integer("erase_count").notNull().default(0),
  durationMs: integer("duration_ms").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
