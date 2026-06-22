import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { useParams, Link, useLocation } from "wouter";
import {
  useGetDiagnosticAttempt,
  useSaveDiagnosticAnswer,
  useSubmitDiagnostic,
  type DiagnosticResult,
  type KeystrokeTrace,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AnswerInput } from "@/components/AnswerInput";
import { MultipleChoice } from "@/components/MultipleChoice";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CheckCircle2, XCircle } from "lucide-react";

export default function AssessmentRunner() {
  const params = useParams();
  const attemptId = Number(params.attemptId);
  const [, setLocation] = useLocation();

  const { data: attempt, isLoading } = useGetDiagnosticAttempt(attemptId || 0, {
    query: { enabled: !!attemptId, queryKey: ["diagnostic-attempt", attemptId] },
  });
  const saveAnswer = useSaveDiagnosticAnswer();
  const submit = useSubmitDiagnostic();

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const seededRef = useRef(false);
  useEffect(() => {
    if (attempt && !seededRef.current) {
      seededRef.current = true;
      const seed: Record<number, string> = {};
      attempt.responses.forEach((r) => (seed[r.questionId] = r.answer));
      if (Object.keys(seed).length > 0) setAnswers((prev) => ({ ...seed, ...prev }));
    }
  }, [attempt]);

  const persist = (questionId: number, val: string, trace?: KeystrokeTrace) => {
    if (!attemptId) return;
    saveAnswer.mutate({ attemptId, data: { questionId, answer: val, trace } });
  };

  const handleWritten = (questionId: number, val: string, trace: KeystrokeTrace) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
    persist(questionId, val, trace);
  };

  const handleMc = (questionId: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
    persist(questionId, val);
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!attemptId) return;
    setSubmitError(null);
    submit.mutate(
      { attemptId },
      {
        onSuccess: (data) => setResult(data),
        onError: () =>
          setSubmitError(
            "Please answer every question before submitting — completing the assessment is what earns credit.",
          ),
      },
    );
  };

  if (isLoading || !attempt) {
    return (
      <Layout>
        <div className="p-8 max-w-3xl mx-auto w-full flex flex-col gap-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (result) {
    return (
      <Layout>
        <div className="p-8 max-w-3xl mx-auto w-full flex flex-col gap-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-serif font-bold text-primary mb-2">
                {result.title}
              </h1>
              <p className="text-muted-foreground">
                Completed — full credit earned. Score (for your reference):{" "}
                {result.percent}% ({result.score}/{result.total})
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Completion credit so far: {result.creditPercent}%
              </p>
            </div>
            <Link href="/assessments">
              <Button variant="outline">Back</Button>
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {result.perQuestion.map((q, i) => (
              <div
                key={q.questionId}
                className={`p-5 rounded-lg border ${
                  q.correct
                    ? "border-chart-2/50 bg-chart-2/5"
                    : "border-destructive/40 bg-destructive/5"
                }`}
              >
                <div className="flex items-start gap-2 mb-3">
                  {q.correct ? (
                    <CheckCircle2 className="w-5 h-5 text-chart-2 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div className="font-medium">
                    Question {i + 1}
                    <span className="ml-2 text-xs uppercase tracking-wider text-muted-foreground">
                      {q.type === "mc" ? "Multiple choice" : "Written"}
                    </span>
                  </div>
                </div>
                <div className="text-sm mb-3">
                  <MarkdownRenderer content={q.prompt} />
                </div>
                <div className="mb-2 text-sm">
                  <span className="font-semibold">Your answer:</span>{" "}
                  <span className="font-mono">{q.yourAnswer || "No answer"}</span>
                </div>
                {!q.correct && (
                  <div className="mb-2 text-sm text-primary">
                    <span className="font-semibold">Model answer:</span>{" "}
                    <span className="font-mono">{q.correctAnswer}</span>
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold">Why:</span> {q.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const question = attempt.questions[idx];
  const total = attempt.questions.length;
  const answeredCount = attempt.questions.filter(
    (q) => (answers[q.id] ?? "").trim().length > 0,
  ).length;

  return (
    <Layout>
      <div className="p-8 max-w-3xl mx-auto w-full flex flex-col gap-6 pb-24">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-primary">{attempt.title}</h1>
            <p className="text-sm text-muted-foreground">
              Question {idx + 1} of {total} · {answeredCount} answered
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/assessments")}
          >
            Save &amp; exit
          </Button>
        </div>

        {question ? (
          <div className="flex flex-col gap-8">
            <div className="prose prose-slate dark:prose-invert max-w-none text-lg">
              <MarkdownRenderer content={question.prompt} />
            </div>

            {question.type === "mc" && question.options ? (
              <MultipleChoice
                options={question.options}
                value={answers[question.id] ?? ""}
                onChange={(val) => handleMc(question.id, val)}
              />
            ) : (
              <AnswerInput
                value={answers[question.id] ?? ""}
                onChange={(val, trace) => handleWritten(question.id, val, trace)}
                promptSource={question.prompt}
                placeholder="Explain in your own words…"
              />
            )}

            <div className="flex justify-between mt-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIdx((p) => Math.max(0, p - 1))}
                disabled={idx === 0}
              >
                Previous
              </Button>
              {idx < total - 1 ? (
                <Button onClick={() => setIdx((p) => Math.min(total - 1, p + 1))}>
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-chart-2 hover:bg-chart-2/90 text-white"
                  disabled={submit.isPending || answeredCount < total}
                  data-testid="button-submit-assessment"
                >
                  {submit.isPending ? "Submitting…" : "Submit assessment"}
                </Button>
              )}
            </div>
            {answeredCount < total ? (
              <p className="text-sm text-muted-foreground text-right">
                Answer all {total} questions to submit ({total - answeredCount} left).
              </p>
            ) : null}
            {submitError ? (
              <p className="text-sm text-destructive text-right">{submitError}</p>
            ) : null}
          </div>
        ) : (
          <div>Question not found.</div>
        )}
      </div>
    </Layout>
  );
}
