// Public course download: every lecture (short version) plus a sample of
// practice homework and exam problems, as PDF or plain text.
import { Router, type IRouter } from "express";
import { asc, eq, inArray } from "drizzle-orm";
import PDFDocument from "pdfkit";
import {
  db,
  lecturesTable,
  assignmentsTable,
  problemsTable,
} from "@workspace/db";

const router: IRouter = Router();

const COURSE_TITLE = "Teach Yourself AI";
const SUBTITLE =
  "A four-week introductory course on the ideas behind artificial intelligence";

interface CourseDump {
  lectures: { weekNumber: number; title: string; body: string }[];
  samples: {
    label: string;
    problems: { prompt: string }[];
  }[];
}

async function buildCourseDump(): Promise<CourseDump> {
  const lectures = await db
    .select({
      weekNumber: lecturesTable.weekNumber,
      title: lecturesTable.title,
      body: lecturesTable.body,
    })
    .from(lecturesTable)
    .orderBy(asc(lecturesTable.weekNumber), asc(lecturesTable.id));

  // A few practice homeworks + exams: first homework of each week,
  // plus the midterm and final.
  const assignments = await db
    .select()
    .from(assignmentsTable)
    .orderBy(asc(assignmentsTable.weekNumber), asc(assignmentsTable.position));

  const picked: typeof assignments = [];
  const seenHomeworkWeeks = new Set<number>();
  for (const a of assignments) {
    if (a.kind === "homework" && !seenHomeworkWeeks.has(a.weekNumber)) {
      seenHomeworkWeeks.add(a.weekNumber);
      picked.push(a);
    } else if (a.kind === "midterm" || a.kind === "final") {
      picked.push(a);
    }
  }

  const problems = picked.length
    ? await db
        .select({
          assignmentId: problemsTable.assignmentId,
          position: problemsTable.position,
          prompt: problemsTable.prompt,
        })
        .from(problemsTable)
        .where(inArray(problemsTable.assignmentId, picked.map((a) => a.id)))
        .orderBy(asc(problemsTable.position))
    : [];

  const samples = picked.map((a) => ({
    label: `${a.title} (practice)`,
    problems: problems
      .filter((p) => p.assignmentId === a.id)
      .map((p) => ({ prompt: p.prompt })),
  }));

  return { lectures, samples };
}

function asText(dump: CourseDump): string {
  const lines: string[] = [
    COURSE_TITLE,
    SUBTITLE,
    "=".repeat(70),
    "",
    "LECTURES",
    "",
  ];
  for (const lec of dump.lectures) {
    lines.push(lec.title, "-".repeat(Math.min(lec.title.length, 70)), lec.body.trim(), "", "");
  }
  lines.push("PRACTICE PROBLEMS", "");
  for (const s of dump.samples) {
    lines.push(s.label, "-".repeat(Math.min(s.label.length, 70)));
    s.problems.forEach((p, i) => lines.push(`${i + 1}. ${p.prompt}`));
    lines.push("", "");
  }
  return lines.join("\n");
}

router.get("/course/download", async (req, res): Promise<void> => {
  const format = req.query.format === "txt" ? "txt" : "pdf";
  try {
    const dump = await buildCourseDump();

    if (format === "txt") {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="teach-yourself-ai-course.txt"',
      );
      res.send(asText(dump));
      return;
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="teach-yourself-ai-course.pdf"',
    );
    const doc = new PDFDocument({ margin: 54, bufferPages: true });
    doc.pipe(res);

    doc.font("Times-Bold").fontSize(24).text(COURSE_TITLE);
    doc.moveDown(0.3);
    doc.font("Times-Roman").fontSize(12).fillColor("#444444").text(SUBTITLE);
    doc.fillColor("black").moveDown(1.5);

    doc.font("Times-Bold").fontSize(16).text("Lectures");
    doc.moveDown(0.8);
    for (const lec of dump.lectures) {
      doc.font("Times-Bold").fontSize(13).text(lec.title);
      doc.moveDown(0.3);
      doc.font("Times-Roman").fontSize(11).text(lec.body.trim(), { lineGap: 2 });
      doc.moveDown(1);
    }

    doc.addPage();
    doc.font("Times-Bold").fontSize(16).text("Practice Problems");
    doc.moveDown(0.8);
    for (const s of dump.samples) {
      doc.font("Times-Bold").fontSize(13).text(s.label);
      doc.moveDown(0.3);
      s.problems.forEach((p, i) => {
        doc.font("Times-Roman").fontSize(11).text(`${i + 1}. ${p.prompt}`, { lineGap: 2 });
        doc.moveDown(0.3);
      });
      doc.moveDown(0.8);
    }

    doc.end();
  } catch (err) {
    req.log.error({ err }, "course download failed");
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to build course download" });
    } else {
      res.end();
    }
  }
});

export default router;
