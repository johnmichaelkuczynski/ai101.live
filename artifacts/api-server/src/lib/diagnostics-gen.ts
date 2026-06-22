import { chatJson } from "./ai";
import { db, topicsTable, lecturesTable } from "@workspace/db";
import { inArray } from "drizzle-orm";
import { FORMATS, type DiagnosticFormat, type SlotDef } from "./diagnostics-config";

export interface GeneratedQuestion {
  type: "mc" | "written";
  prompt: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string;
  topicId: number | null;
  weekNumber: number | null;
}

interface RawQuestion {
  type?: string;
  prompt?: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer?: string;
  explanation?: string;
  topicTitle?: string | null;
}

type TopicRow = { id: number; title: string; weekNumber: number; blurb: string | null };

async function topicsForWeeks(weeks: number[]): Promise<TopicRow[]> {
  if (weeks.length === 0) return [];
  const rows = await db
    .select({
      id: topicsTable.id,
      title: topicsTable.title,
      weekNumber: topicsTable.weekNumber,
      blurb: topicsTable.blurb,
    })
    .from(topicsTable);
  return rows.filter((r) => weeks.includes(r.weekNumber));
}

function mapRaw(
  raw: RawQuestion[],
  topics: TopicRow[],
): GeneratedQuestion[] {
  const byTitle = new Map(topics.map((t) => [t.title.toLowerCase().trim(), t]));
  const out: GeneratedQuestion[] = [];
  for (const q of raw) {
    const type = q.type === "mc" ? "mc" : "written";
    const prompt = (q.prompt ?? "").trim();
    if (!prompt) continue;
    let options: string[] | null = null;
    let correctAnswer = (q.correctAnswer ?? "").trim();
    if (type === "mc") {
      const opts = (q.options ?? []).map((o) => String(o).trim()).filter(Boolean);
      if (opts.length < 2) continue;
      options = opts;
      const idx =
        typeof q.correctIndex === "number" && q.correctIndex >= 0 && q.correctIndex < opts.length
          ? q.correctIndex
          : 0;
      correctAnswer = opts[idx]!;
    }
    if (!correctAnswer) continue;
    const topic = q.topicTitle ? byTitle.get(q.topicTitle.toLowerCase().trim()) : undefined;
    out.push({
      type,
      prompt,
      options,
      correctAnswer,
      explanation: (q.explanation ?? "").trim() || "Review the relevant lecture.",
      topicId: topic?.id ?? null,
      weekNumber: topic?.weekNumber ?? null,
    });
  }
  return out;
}

function nonce(): string {
  return Math.random().toString(36).slice(2, 10);
}

// Generate exactly `mc` multiple-choice and `written` short-answer questions.
// The model is asked for the exact split, but we still validate the result and
// retry (accumulating usable questions) so a persisted assessment always has the
// correct format composition. Extras are trimmed; a persistent shortfall throws.
async function generate(
  system: string,
  user: string,
  topics: TopicRow[],
  mc: number,
  written: number,
): Promise<GeneratedQuestion[]> {
  const mcPool: GeneratedQuestion[] = [];
  const writtenPool: GeneratedQuestion[] = [];
  for (let attempt = 0; attempt < 3; attempt++) {
    const needMc = mc - mcPool.length;
    const needWritten = written - writtenPool.length;
    if (needMc <= 0 && needWritten <= 0) break;
    const ask =
      attempt === 0
        ? user
        : `${user} I still need ${Math.max(0, needMc)} more multiple-choice and ${Math.max(
            0,
            needWritten,
          )} more written questions. Return only those (variation seed: ${nonce()}).`;
    const result = await chatJson<{ questions?: RawQuestion[] }>(system, ask);
    for (const q of mapRaw(result.questions ?? [], topics)) {
      if (q.type === "mc" && mcPool.length < mc) mcPool.push(q);
      else if (q.type === "written" && writtenPool.length < written) writtenPool.push(q);
    }
  }
  if (mcPool.length < mc || writtenPool.length < written) {
    throw new Error(
      `Generator returned ${mcPool.length}/${mc} MC and ${writtenPool.length}/${written} written questions`,
    );
  }
  // Interleave so the take-view alternates types rather than grouping them.
  const out: GeneratedQuestion[] = [];
  const max = Math.max(mc, written);
  for (let i = 0; i < max; i++) {
    if (i < mc) out.push(mcPool[i]!);
    if (i < written) out.push(writtenPool[i]!);
  }
  return out;
}

const SHARED_RULES = `You write conceptual assessment questions for an introductory artificial-intelligence course aimed at curious beginners with NO math or coding background. Every question must be answerable in plain English.
- A "mc" (multiple-choice) question MUST have exactly 4 distinct options, with "correctIndex" giving the 0-based index of the single best option. Distractors must be plausible but clearly wrong to someone who understands the concept.
- A "written" question is a short-answer conceptual question (define a term, draw a distinction, explain why something works, or identify an example); "correctAnswer" is a concise one-or-two-sentence model answer.
- "explanation" (1-2 sentences) states the key idea and why the answer is right.
- Never ask for calculations or code. Vary phrasing and topics so repeated assessments feel fresh.
Respond as strict JSON: {"questions": [{"type": "mc"|"written", "prompt": string, "options": string[4] (mc only), "correctIndex": number (mc only), "correctAnswer": string, "explanation": string, "topicTitle": string|null}]}.`;

async function generateAptitude(mc: number, written: number): Promise<GeneratedQuestion[]> {
  const system = `${SHARED_RULES}
This is a PRE-COURSE APTITUDE check taken before any lectures. Do NOT assume the student knows course-specific terminology. Test general reasoning, everyday familiarity with technology, logical thinking, and basic intuitions about how computers and "smart" systems behave. Set "topicTitle" to null for every question.`;
  const user = `Generate exactly ${mc} multiple-choice and ${written} written aptitude questions (variation seed: ${nonce()}).`;
  return generate(system, user, [], mc, written);
}

async function generateMastery(
  slotTitle: string,
  topics: TopicRow[],
  mc: number,
  written: number,
  extra: string,
): Promise<GeneratedQuestion[]> {
  const grounding = topics
    .map((t) => `- "${t.title}" (Week ${t.weekNumber}): ${t.blurb ?? ""}`)
    .join("\n");
  const system = `${SHARED_RULES}
This assessment is "${slotTitle}". Draw questions ONLY from these course topics, and set each question's "topicTitle" to the EXACT topic title it tests:
${grounding}
${extra}`;
  const user = `Generate exactly ${mc} multiple-choice and ${written} written questions spread across the listed topics (variation seed: ${nonce()}).`;
  return generate(system, user, topics, mc, written);
}

// Generate the questions for one of the seven fixed-slot assessments.
export async function generateForSlot(
  slot: SlotDef,
  format: DiagnosticFormat,
): Promise<GeneratedQuestion[]> {
  const { mc, written } = FORMATS[format];
  if (slot.aptitude) return generateAptitude(mc, written);
  const topics = await topicsForWeeks(slot.weeks);
  return generateMastery(slot.title, topics, mc, written, "");
}

// Generate a learner-built custom assessment that focuses on weak/untested
// topics inside the requested scope and skips already-mastered material.
export async function generateCustom(opts: {
  scopeText: string;
  topics: TopicRow[];
  mastery: Map<number, { attempts: number; accuracy: number }>;
  mc: number;
  written: number;
}): Promise<GeneratedQuestion[]> {
  const ranked = opts.topics.map((t) => {
    const m = opts.mastery.get(t.id);
    const status =
      !m || m.attempts === 0
        ? "untested"
        : m.accuracy >= 0.85
        ? "mastered"
        : m.accuracy >= 0.6
        ? "developing"
        : "weak";
    return { t, status };
  });
  const focus = ranked.filter((r) => r.status !== "mastered");
  const usable = focus.length > 0 ? focus : ranked;
  const grounding = usable
    .map((r) => `- "${r.t.title}" (Week ${r.t.weekNumber}) [${r.status}]: ${r.t.blurb ?? ""}`)
    .join("\n");
  const system = `${SHARED_RULES}
This is a CUSTOM assessment the learner requested. Their scope request: "${opts.scopeText}".
Draw questions ONLY from these topics, prioritizing the ones marked [weak] or [untested] and AVOIDING ones marked [mastered] unless nothing else is available. Set each question's "topicTitle" to the EXACT topic title it tests:
${grounding}`;
  const user = `Generate exactly ${opts.mc} multiple-choice and ${opts.written} written questions focused on the learner's weak and untested areas within their requested scope (variation seed: ${nonce()}).`;
  return generate(system, user, usable.map((r) => r.t), opts.mc, opts.written);
}

export { topicsForWeeks };
export type { TopicRow };
