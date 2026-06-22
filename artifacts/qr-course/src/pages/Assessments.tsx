import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLocation } from "wouter";
import {
  useGetDiagnosticOverview,
  useGetDiagnosticPerformance,
  useStartDiagnostic,
  useStartCustomDiagnostic,
  type DiagnosticSlot,
  type DiagnosticFormatStatus,
} from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Sparkles, Target, History } from "lucide-react";

const FORMAT_BLURB: Record<string, string> = {
  mc: "Multiple choice only",
  written: "Short written answers",
  hybrid: "Mix of multiple choice + written",
  official: "The required graded format (counts toward credit)",
};

function FormatRow({
  slotKey,
  fmt,
  onStart,
  starting,
}: {
  slotKey: string;
  fmt: DiagnosticFormatStatus;
  onStart: (slotKey: string, format: string) => void;
  starting: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-t border-border/60 first:border-t-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{fmt.label}</span>
          {fmt.required && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
              Required
            </span>
          )}
          {fmt.completed && <CheckCircle2 className="w-4 h-4 text-chart-2" />}
        </div>
        <div className="text-xs text-muted-foreground">
          {FORMAT_BLURB[fmt.format]} · {fmt.questionCount} questions
          {fmt.attemptsCount > 0 && ` · ${fmt.attemptsCount} taken`}
          {fmt.bestScore != null && ` · best ${fmt.bestScore}%`}
        </div>
      </div>
      <Button
        size="sm"
        variant={fmt.completed ? "outline" : "default"}
        disabled={starting}
        onClick={() => onStart(slotKey, fmt.format)}
        data-testid={`button-start-${slotKey}-${fmt.format}`}
      >
        {fmt.attemptsCount > 0 ? "Retake" : "Start"}
      </Button>
    </div>
  );
}

function SlotCard({
  slot,
  onStart,
  starting,
}: {
  slot: DiagnosticSlot;
  onStart: (slotKey: string, format: string) => void;
  starting: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {slot.when}
          </span>
          {slot.aptitude && (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-chart-4/20 text-chart-4">
              Aptitude
            </span>
          )}
        </div>
        <CardTitle className="text-lg">{slot.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        {slot.formats.map((fmt) => (
          <FormatRow
            key={fmt.format}
            slotKey={slot.key}
            fmt={fmt}
            onStart={onStart}
            starting={starting}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function CustomBuilder({
  onBuild,
  building,
}: {
  onBuild: (scope: string) => void;
  building: boolean;
}) {
  const [scope, setScope] = useState("");
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Build an assessment for my needs
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Describe what you want to be tested on. We focus on your weak and untested
          topics and skip what you've already mastered. Fresh questions every time.
        </p>
        <textarea
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          placeholder='e.g. "Just Week 2 — supervised vs unsupervised learning" or "everything I struggle with"'
          className="w-full min-h-[90px] p-3 bg-card border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          data-testid="input-custom-scope"
        />
        <Button
          onClick={() => onBuild(scope)}
          disabled={building || scope.trim().length === 0}
          className="self-start"
          data-testid="button-build-custom"
        >
          <Sparkles className={`w-4 h-4 mr-2 ${building ? "animate-pulse" : ""}`} />
          {building ? "Building…" : "Build my assessment"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Assessments() {
  const [, setLocation] = useLocation();
  const { data: overview, isLoading } = useGetDiagnosticOverview();
  const { data: performance } = useGetDiagnosticPerformance();
  const startDiagnostic = useStartDiagnostic();
  const startCustom = useStartCustomDiagnostic();

  const starting = startDiagnostic.isPending || startCustom.isPending;

  const handleStart = (slotKey: string, format: string) => {
    startDiagnostic.mutate(
      { data: { slotKey, format: format as "mc" | "written" | "hybrid" | "official" } },
      { onSuccess: (data) => setLocation(`/assessments/run/${data.id}`) },
    );
  };

  const handleBuild = (scope: string) => {
    startCustom.mutate(
      { data: { scopeText: scope } },
      { onSuccess: (data) => setLocation(`/assessments/run/${data.id}`) },
    );
  };

  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto w-full flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">
            Diagnostic Assessments
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Check where you stand at each stage of the course. Only the{" "}
            <span className="font-semibold text-foreground">Official</span> format is
            required — completing all of them is worth{" "}
            <span className="font-semibold text-foreground">
              {overview?.creditMax ?? 20}% of your grade
            </span>
            . These are scored for completion, not correctness, so just finishing earns
            full credit. Every retake generates brand-new questions.
          </p>
        </div>

        {/* Credit summary */}
        {overview && (
          <div className="rounded-lg border border-border bg-card p-5 flex flex-wrap items-center gap-6">
            <div>
              <div className="text-3xl font-serif font-bold text-primary">
                {overview.creditPercent}
                <span className="text-lg text-muted-foreground">
                  {" "}
                  / {overview.creditMax}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Completion credit earned
              </div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="text-3xl font-serif font-bold">
                {overview.officialCompleted}
                <span className="text-lg text-muted-foreground">
                  {" "}
                  / {overview.officialRequired}
                </span>
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Required officials completed
              </div>
            </div>
          </div>
        )}

        <CustomBuilder onBuild={handleBuild} building={startCustom.isPending} />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overview?.slots.map((slot) => (
              <SlotCard
                key={slot.key}
                slot={slot}
                onStart={handleStart}
                starting={starting}
              />
            ))}
          </div>
        )}

        {/* Performance */}
        {performance && performance.perWeek.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-serif font-semibold border-b pb-2">
              Your performance
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {performance.perWeek.map((w) => (
                <div key={w.weekNumber} className="rounded-md border border-border p-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Week {w.weekNumber}
                  </div>
                  <div className="text-2xl font-serif font-bold">
                    {Math.round(w.accuracy * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {w.attempts} answered
                  </div>
                </div>
              ))}
            </div>
            {performance.recent.length > 0 && (
              <div className="rounded-lg border border-border">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border text-sm font-medium">
                  <History className="w-4 h-4" />
                  Recent assessments
                </div>
                <div className="divide-y divide-border">
                  {performance.recent.map((r) => (
                    <div
                      key={r.attemptId}
                      className="flex items-center justify-between px-4 py-2.5 text-sm"
                    >
                      <span className="truncate">{r.label}</span>
                      <span className="text-muted-foreground shrink-0 ml-4">
                        {r.percent}% ·{" "}
                        {new Date(r.at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
