// Configuration for diagnostic assessments. Seven fixed slots, each available
// in four formats. Only the "official" format is required; completing the
// official assessment for every slot earns the full 20% diagnostic credit.

export type SlotKey = "pre" | "w1" | "w2" | "w1_2" | "w3" | "w4" | "w1_4";
export type DiagnosticFormat = "mc" | "written" | "hybrid" | "official";

export interface SlotDef {
  key: SlotKey;
  title: string;
  when: string;
  aptitude: boolean;
  weeks: number[];
}

export const SLOTS: SlotDef[] = [
  {
    key: "pre",
    title: "Pre-Course Aptitude Check",
    when: "Before Week 1",
    aptitude: true,
    weeks: [],
  },
  { key: "w1", title: "End of Week 1", when: "After Week 1", aptitude: false, weeks: [1] },
  { key: "w2", title: "End of Week 2", when: "After Week 2", aptitude: false, weeks: [2] },
  {
    key: "w1_2",
    title: "Weeks 1–2 Cumulative",
    when: "After Week 2",
    aptitude: false,
    weeks: [1, 2],
  },
  { key: "w3", title: "End of Week 3", when: "After Week 3", aptitude: false, weeks: [3] },
  { key: "w4", title: "End of Week 4", when: "After Week 4", aptitude: false, weeks: [4] },
  {
    key: "w1_4",
    title: "Weeks 1–4 Comprehensive",
    when: "After Week 4",
    aptitude: false,
    weeks: [1, 2, 3, 4],
  },
];

export interface FormatDef {
  format: DiagnosticFormat;
  label: string;
  required: boolean;
  // number of multiple-choice and written questions in this format
  mc: number;
  written: number;
}

// Short formats are six questions; the official format is twice as long.
export const FORMATS: Record<DiagnosticFormat, FormatDef> = {
  mc: { format: "mc", label: "Multiple Choice", required: false, mc: 6, written: 0 },
  written: { format: "written", label: "Written Answer", required: false, mc: 0, written: 6 },
  hybrid: { format: "hybrid", label: "Hybrid", required: false, mc: 3, written: 3 },
  official: { format: "official", label: "Official", required: true, mc: 6, written: 6 },
};

export const FORMAT_ORDER: DiagnosticFormat[] = ["mc", "written", "hybrid", "official"];

export function questionCount(format: DiagnosticFormat): number {
  const f = FORMATS[format];
  return f.mc + f.written;
}

export function slotByKey(key: string): SlotDef | undefined {
  return SLOTS.find((s) => s.key === key);
}

export const CREDIT_MAX = 20; // diagnostics are worth 20% of the overall grade
