import { Link } from "wouter";
import { BookOpen, Bot, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

const weeks = [
  {
    n: 1,
    title: "Fundamental Concepts",
    blurb:
      "Inference, entailment vs. pattern activation, confirmation vs. confidence, the ampliative thesis, knowledge in an AI system, and anti-skeptical epistemology.",
  },
  {
    n: 2,
    title: "Notational Conventions",
    blurb:
      "Why AI logic needs new notation, defeasible inference, non-monotonic reasoning, embedding-space relationships, marking confidence, and the limits of formalization.",
  },
  {
    n: 3,
    title: "Meta-Logical Principles",
    blurb:
      "Reconceived soundness and completeness, defeasibility as a governing principle, consistency under revision, pattern recognition as a primitive, and the meta-logic of learning.",
  },
  {
    n: 4,
    title: "Models",
    blurb:
      "What a model is in AI logic, neural networks and embedding spaces as models, binding data, parsimony, testing and revising, and the hybrid frontier.",
  },
];

const features = [
  {
    icon: BookOpen,
    title: "32 micro-lectures",
    text: "Short, connected ideas at three depths \u2014 read it briefly or go deep on any concept.",
  },
  {
    icon: Bot,
    title: "A tutor that knows the lecture",
    text: "Ask questions and get answers grounded in the exact section you\u2019re reading.",
  },
  {
    icon: ShieldCheck,
    title: "Explain it in your own words",
    text: "Conceptual short-answer questions, graded by AI for the idea \u2014 no math or code required.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-serif font-bold text-sm">
              AI
            </div>
            <span className="font-serif font-semibold text-lg tracking-tight">
              AI Logic
            </span>
          </div>
          <Link href="/sign-in">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-border hover:bg-secondary transition-colors">
              Sign in
            </button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto w-full px-6 pt-20 pb-16 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            A four-unit course on how AI actually reasons
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary max-w-3xl leading-tight">
            AI Logic — how machines reason, not how textbooks say they should.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
            What is inference when there are no rules? How does entailment become
            pattern activation? Why is AI ampliative — and fallible — by nature?
            Learn the logic behind modern AI in plain English — no math or coding
            required.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/sign-up">
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md text-base font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                Get started
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/sign-in">
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md text-base font-medium border border-border hover:bg-secondary transition-colors">
                Sign in with Google
              </button>
            </Link>
          </div>
        </section>

        <section className="max-w-6xl mx-auto w-full px-6 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-card-border bg-card p-6 flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center text-primary">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto w-full px-6 pb-24">
          <h2 className="text-2xl font-serif font-bold mb-6">The curriculum</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {weeks.map((w) => (
              <div
                key={w.n}
                className="rounded-lg border border-card-border bg-card p-6"
              >
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Unit {w.n}
                </div>
                <h3 className="text-lg font-serif font-semibold mb-2">
                  {w.title}
                </h3>
                <p className="text-sm text-muted-foreground">{w.blurb}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/sign-up">
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md text-base font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                Start the course
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto w-full px-6 py-6 text-sm text-muted-foreground text-center">
          AI Logic by Zhi Systems — read the idea, ground the idea, explain the idea.
        </div>
      </footer>
    </div>
  );
}
